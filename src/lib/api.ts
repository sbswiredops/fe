/* eslint-disable @typescript-eslint/no-unused-vars */
import { API_CONFIG } from './config';
import { ApiResponse, ApiError } from '@/types/api';

// Detect whether an API base URL is usable in the current runtime
export const isApiConfigured = (): boolean => {
  try {
    const base = (API_CONFIG?.BASE_URL || '').trim();
    if (!base) return false;

    const isLocalBase = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(base);
    if (typeof window !== 'undefined') {
      const host = window.location?.hostname || '';
      const isLocalSite = /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(host);
      if (isLocalBase && !isLocalSite) return false;
    }

    return /^https?:\/\//i.test(base);
  } catch {
    return false;
  }
};

// API Client Configuration
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private runtimeToken: string | null = null; // optional runtime token
  private endpoints = API_CONFIG.ENDPOINTS;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Call after login/logout to override token used by client
  public setAuthToken(token: string | null) {
    this.runtimeToken = token;
  }

  private getAuthToken(): string | null {
    // runtime token takes priority
    if (this.runtimeToken) return this.runtimeToken;

    // Get token from storage or cookies (client-only)
    if (typeof window !== 'undefined') {
      // Common key candidates
      const KEYS = [
        'auth_token',
        'access_token',   // preferred
        'accessToken',
        'token',
        'jwt',
        'id_token',
      ];

      // Try storage first
      for (const k of KEYS) {
        const v = localStorage.getItem(k) || sessionStorage.getItem(k);
        if (v) return v;
      }

      // Fallback to cookies
      const readCookie = (name: string) => {
        const m = document.cookie.match(
          new RegExp('(?:^|;\\s*)' + name.replace(/[-[\]{}()*+?.^$|]/g, '\\$&') + '=([^;]*)')
        );
        return m ? decodeURIComponent(m[1]) : null;
      };

      for (const k of KEYS) {
        const v = readCookie(k);
        if (v) return v;
      }
    }
    return null;
  }

  private getHeaders(
    customHeaders?: Record<string, string>,
    opts?: { omitJsonContentType?: boolean }
  ): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders, ...customHeaders };

    if (opts?.omitJsonContentType) {
      delete headers['Content-Type'];
    }

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private joinUrl(endpoint: string): string {
    const base = this.baseURL.replace(/\/+$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  // Central fetch wrapper that auto-refreshes on 401
  private async fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const doFetch = () => fetch(input, init);
    let response = await doFetch();

    if (response.status !== 401) {
      return response;
    }

    const msg = await this.parseErrorMessage(response);

    // Hard fail on explicit session replacement
    if (msg && msg.toLowerCase().includes('session expired due to new login')) {
      this.onAuthFailure('session-replaced');
      throw new Error(msg);
    }

    // Try refresh once, then retry the original request
    const newAccess = await this.refreshAccessToken().catch(() => null);
    if (!newAccess) {
      this.onAuthFailure('refresh-failed');
      throw new Error(msg || 'Unauthorized');
    }

    // Update Authorization header for retry
    const retryHeaders = new Headers(init?.headers as any);
    retryHeaders.set('Authorization', `Bearer ${newAccess}`);

    response = await fetch(input, { ...init, headers: retryHeaders });
    return response;
  }

  // Parse JSON/text error message safely
  private async parseErrorMessage(response: Response): Promise<string | null> {
    try {
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await response.json();
        return data?.message || data?.error || null;
      }
      const text = await response.text();
      return text || null;
    } catch {
      return null;
    }
  }

  // Refresh using stored refresh_token (single-flight)
  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (!refreshToken) return null;

      try {
        const resp = await fetch(this.joinUrl(this.endpoints.AUTH_REFRESH_TOKEN), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        });

        const ct = resp.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await resp.json() : null;
        if (!resp.ok) {
          const msg = data?.message || `HTTP ${resp.status}`;
          if (msg.toLowerCase().includes('session expired due to new login')) {
            this.onAuthFailure('session-replaced');
          }
          return null;
        }

        const payload = data && typeof data === 'object' && 'data' in data ? (data as any).data : data;
        const newAccess: string | undefined = payload?.accessToken;
        const newRefresh: string | undefined = payload?.refreshToken;

        if (newAccess) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', newAccess);
            if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
          }
          this.setAuthToken(newAccess);
          return newAccess;
        }

        return null;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Clear tokens and notify app
  private onAuthFailure(reason: 'session-replaced' | 'refresh-failed') {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: reason }));
      }
      this.setAuthToken(null);
    } catch {
      // ignore
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type') || '';

    // Gracefully handle 204 No Content
    if (response.status === 204) {
      return { success: true } as unknown as ApiResponse<T>;
    }

    // Try JSON first if indicated
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        return data;
      } catch (err) {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error('Failed to parse response JSON');
      }
    }

    // Fallback to text for non-JSON responses
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }
    return {
      success: true,
      data: text as unknown as T,
    };
  }

  async get<T>(endpoint: string, params?: Record<string, any>, options?: { signal?: AbortSignal }): Promise<ApiResponse<T>> {
    const url = new URL(this.joinUrl(endpoint));

    if (params) {
      const query = buildQueryString(params);
      if (query) {
        new URLSearchParams(query).forEach((v, k) => url.searchParams.append(k, v));
      }
    }

    const response = await this.fetchWithAuth(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      signal: options?.signal,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<T>> {
    const isForm = (typeof FormData !== 'undefined') && data instanceof FormData;

    const response = await this.fetchWithAuth(this.joinUrl(endpoint), {
      method: 'POST',
      headers: this.getHeaders(customHeaders, { omitJsonContentType: isForm } ),
      body: isForm ? data : (data !== undefined ? JSON.stringify(data) : undefined),
      signal: options?.signal,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any, options?: { signal?: AbortSignal }): Promise<ApiResponse<T>> {
    const isForm = (typeof FormData !== 'undefined') && data instanceof FormData;

    const response = await this.fetchWithAuth(this.joinUrl(endpoint), {
      method: 'PATCH',
      headers: this.getHeaders(undefined, { omitJsonContentType: isForm }),
      body: isForm ? data : (data !== undefined ? JSON.stringify(data) : undefined),
      signal: options?.signal,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, options?: { signal?: AbortSignal }): Promise<ApiResponse<T>> {
    const isForm = (typeof FormData !== 'undefined') && data instanceof FormData;

    const response = await this.fetchWithAuth(this.joinUrl(endpoint), {
      method: 'PUT',
      headers: this.getHeaders(undefined, { omitJsonContentType: isForm }),
      body: isForm ? data : (data !== undefined ? JSON.stringify(data) : undefined),
      signal: options?.signal,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: { signal?: AbortSignal }): Promise<ApiResponse<T>> {
    const response = await this.fetchWithAuth(this.joinUrl(endpoint), {
      method: 'DELETE',
      headers: this.getHeaders(),
      signal: options?.signal,
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(endpoint: string, file: File | FormData, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = file instanceof FormData ? file : new FormData();

      if (!(file instanceof FormData)) {
        formData.append('file', file);
      }

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        try {
          if (!xhr.responseText) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({ success: true } as unknown as ApiResponse<T>);
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
            return;
          }

          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(new Error(response?.message || 'Upload failed'));
          }
        } catch {
          reject(new Error('Failed to parse upload response'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      const token = this.getAuthToken();
      xhr.open('POST', this.joinUrl(endpoint));
      xhr.withCredentials = true;

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility functions for common API operations
export const handleApiError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.keys(params || {}).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((v: any) => searchParams.append(`${key}[]`, String(v)));
    } else if (typeof value === 'object') {
      // Shallow-serialize objects as JSON by default
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const createApiError = (message: string, code: string = 'API_ERROR', details?: any): ApiError => ({
  code,
  message,
  details,
});

// Response helper functions
export const createSuccessResponse = <T>(data: T, message?: string, meta?: any): ApiResponse<T> => ({
  success: true,
  data,
  message,
  meta,
});

export const createErrorResponse = (message: string, error?: string): ApiResponse => ({
  success: false,
  message,
  error,
});

// Validation helpers
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`);
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Pagination helpers
export const createPaginationMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  hasNext: limit > 0 ? page < Math.ceil(total / limit) : false,
  hasPrev: page > 1,
});

// Keep original name to avoid breaking imports (typo preserved)
export const parsePag0inationQuery = (query: any) => ({
  page: Number.parseInt(query?.page, 10) || 1,
  limit: Math.min(Number.parseInt(query?.limit, 10) || API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE, API_CONFIG.PAGINATION.MAX_PAGE_SIZE),
  sortBy: query?.sortBy || 'createdAt',
  sortOrder: query?.sortOrder === 'asc' ? 'asc' : 'desc',
});

// File upload validators
export const validateFileSize = (file: File, maxSize: number = API_CONFIG.UPLOAD.MAX_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateImageFile = (file: File): boolean => {
  return validateFileType(file, API_CONFIG.UPLOAD.ALLOWED_IMAGE_TYPES) && 
         validateFileSize(file);
};

export const validateVideoFile = (file: File): boolean => {
  return validateFileType(file, API_CONFIG.UPLOAD.ALLOWED_VIDEO_TYPES) && 
         validateFileSize(file);
};
