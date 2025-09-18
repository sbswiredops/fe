import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse, User } from '@/types/api';

const E = API_CONFIG.ENDPOINTS;

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResendOtpData {
  email: string;
}

type Tokens = {
  accessToken?: string;
  refreshToken?: string;
};

class AuthService {
  private endpoints = E;

  private extractPayload<T = any>(res: any): T {
    // Support both ApiResponse<T> ({ data }) and raw payloads
    return (res && typeof res === 'object' && 'data' in res ? (res as any).data : res) as T;
  }

  private persistAuth(tokens?: Tokens, user?: any) {
    const { accessToken, refreshToken } = tokens || {};
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));

    // Let apiClient prefer this token at runtime
    apiClient.setAuthToken(accessToken ?? null);
  }

  private clearAuth() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    apiClient.setAuthToken(null);
  }

  // Register a new user
  async register(data: RegisterData, options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(this.endpoints.AUTH_REGISTER, data, undefined, options);
  }

  // Verify email with OTP
  async verifyOtp(data: VerifyOtpData, options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(this.endpoints.AUTH_VERIFY_OTP, data, undefined, options);
  }

  // Password reset OTP verify
  async verifyPasswordOtp(data: VerifyOtpData, options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(this.endpoints.AUTH_PASSOTP_VERIFY, data, undefined, options);
  }

  // Login user
  async login(data: LoginData, options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    const res = await apiClient.post<any>(this.endpoints.AUTH_LOGIN, data, undefined, options);
    const payload = this.extractPayload<any>(res);
    const { accessToken, refreshToken, user } = payload || {};
    this.persistAuth({ accessToken, refreshToken }, user);
    return res;
  }

  // Refresh access token
  async refreshToken(options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const res = await apiClient.post<any>(this.endpoints.AUTH_REFRESH_TOKEN, { refreshToken }, undefined, options);
    const payload = this.extractPayload<any>(res);
    const { accessToken, refreshToken: newRefresh } = payload || {};
    this.persistAuth({ accessToken, refreshToken: newRefresh });
    return res;
  }

  // Logout user
  async logout(options?: { signal?: AbortSignal }): Promise<void> {
    try {
      await apiClient.post<any>(this.endpoints.AUTH_LOGOUT, {}, undefined, options);
    } finally {
      this.clearAuth();
    }
  }

  // Request password reset
  async forgotPassword(data: ForgotPasswordData, options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(this.endpoints.AUTH_FORGOT_PASSWORD, data, undefined, options);
  }

  // Reset password with OTP
  async resetPassword(data: ResetPasswordData, options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(this.endpoints.AUTH_RESET_PASSWORD, data, undefined, options);
  }

  // Change password
  async changePassword(data: ChangePasswordData, options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(this.endpoints.AUTH_CHANGE_PASSWORD, data, undefined, options);
  }

  // Resend OTP
  async resendOtp(data: ResendOtpData, options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    return apiClient.post<any>(this.endpoints.AUTH_RESEND_OTP, data, undefined, options);
  }

  // Get token info
  async tokenInfo(options?: { signal?: AbortSignal }): Promise<ApiResponse<any>> {
    return apiClient.get<any>(this.endpoints.AUTH_TOKEN_INFO, undefined, options);
  }

  // Get current user
  async getCurrentUser(options?: { signal?: AbortSignal }): Promise<ApiResponse<User>> {
    return apiClient.get<User>(this.endpoints.AUTH_ME, undefined, options);
    
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Get current user from localStorage
  getCurrentUserFromStorage<T = any>(): T | null {
    try {
      const user = localStorage.getItem('user');
      return user ? (JSON.parse(user) as T) : null;
    } catch {
      return null;
    }
  }

  // Get tokens
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}

const authService = new AuthService();
export default authService;