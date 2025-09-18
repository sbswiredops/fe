import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRoleRequest,
  AssignPermissionsRequest,
  ApiResponse,
  PaginationQuery,
  Permission,
  Role,
} from '@/types/api';

export interface AssignRoleResponse {
  user: User;
  roleChange: {
    previousRole: string;
    newRole: string;
    changedAt: string;
  };
}

export interface GetUserPermissionsResponse {
  userPermissions: Permission[];
  availablePermissions: Permission[];
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

export interface AssignPermissionsResponse {
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  permissions: Permission[];
  permissionChange: {
    previousPermissions: { id: string; name: string }[];
    newPermissions: { id: string; name: string }[];
    changedAt: string;
  };
}

export interface RemovePermissionsResponse {
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  permissions: Permission[];
  removedPermissions: string[];
  removedAt: string;
}

export type ListUsersParams = PaginationQuery & {
  search?: string;
  role?: User['role'] | string;
  status?: User['status'] | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export class UserService {
  private endpoints = API_CONFIG.ENDPOINTS;

  // Users CRUD
  async list(params?: ListUsersParams, options?: { signal?: AbortSignal }): Promise<ApiResponse<User[]>> {
    const toNumber = (v: unknown) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
      return undefined;
    };

    const toSortOrder = (v: unknown): 'ASC' | 'DESC' => {
      const s = typeof v === 'string' ? v.trim().toUpperCase() : '';
      return s === 'DESC' ? 'DESC' : 'ASC';
    };

    const cleaned: Record<string, unknown> = {};
    if (params) {
      const {
        page,
        limit,
        search,
        role,
        status,
        sortBy,
        sortOrder,
        ...rest
      } = params as Record<string, unknown>;

      const p = toNumber(page);
      const l = toNumber(limit);
      if (p && p > 0) cleaned.page = p;
      if (l && l > 0) cleaned.limit = l;

      const s = typeof search === 'string' ? search.trim() : '';
      if (s) cleaned.search = s;

      const r = typeof role === 'string' ? role.trim() : '';
      if (r && r.toLowerCase() !== 'all') cleaned.role = r;

      const st = typeof status === 'string' ? status.trim() : '';
      if (st && st.toLowerCase() !== 'all') cleaned.status = st;

      cleaned.sortBy = (typeof sortBy === 'string' && sortBy.trim()) || 'name';
      cleaned.sortOrder = toSortOrder(sortOrder);

      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
      });
    } else {
      cleaned.sortBy = 'name';
      cleaned.sortOrder = 'ASC';
    }

    return apiClient.get<User[]>(this.endpoints.USERS, cleaned, options);
  }
  async getById(id: string, options?: { signal?: AbortSignal }): Promise<ApiResponse<User>> {
    return apiClient.get<User>(this.endpoints.USER_BY_ID(id), undefined, options);
  }

  async createAdminInstructor(payload: CreateUserRequest, options?: { signal?: AbortSignal }): Promise<ApiResponse<User>> {
    return apiClient.post<User>(this.endpoints.USERS_CREATE_ADMIN_INSTRUCTOR, payload, undefined, options);
  }
  async update(id: string, payload: UpdateUserRequest, options?: { signal?: AbortSignal }): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(this.endpoints.USER_BY_ID(id), payload, options);
  }

  async remove(id: string, options?: { signal?: AbortSignal }): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(this.endpoints.USER_BY_ID(id), options);
  }

  // Role
  async assignRole(
    id: string,
    payload: AssignRoleRequest,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<AssignRoleResponse>> {
    return apiClient.post<AssignRoleResponse>(this.endpoints.USER_ASSIGN_ROLE(id), payload, undefined, options);
  }
  async listRoles(options?: { signal?: AbortSignal }): Promise<ApiResponse<Role[]>> {
    return apiClient.get<Role[]>(this.endpoints.ROLES_LIST, undefined, options);
  }
  // Permissions
  async getPermissions(
    id: string,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<GetUserPermissionsResponse>> {
    return apiClient.get<GetUserPermissionsResponse>(this.endpoints.USER_PERMISSIONS(id), undefined, options);
  }

  async assignPermissions(
    id: string,
    payload: AssignPermissionsRequest,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<AssignPermissionsResponse>> {
    return apiClient.post<AssignPermissionsResponse>(this.endpoints.USER_PERMISSIONS(id), payload, undefined, options);
  }

    // User's enrolled courses
 async getEnrolledCourses(id: string, options?: { signal?: AbortSignal }) {
  return apiClient.get<{ courses: any[] }>(this.endpoints.USER_ENROLLED_COURSES(id), undefined, options);
}

  // User's course stats
  async getCourseStats(id: string, options?: { signal?: AbortSignal }) {
    return apiClient.get<any>(this.endpoints.USER_COURSE_STATS(id), undefined, options);
  }

  // User's completed certificates
  async getCompletedCertificates(id: string, options?: { signal?: AbortSignal }) {
    return apiClient.get<any[]>(this.endpoints.USER_COMPLETED_CERTIFICATES(id), undefined, options);
  }

  ///GET: User's continue learning courses
async getContinueLearning(id: string, options?: { signal?: AbortSignal }) {
  return apiClient.get<{ courses: any[] }>(this.endpoints.USER_CONTINUE_LEARNING(id), undefined, options);
}


  async removePermissions(
    id: string,
    permissionIds: string[],
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<RemovePermissionsResponse>> {
    const ids = Array.from(new Set(permissionIds.map(s => String(s).trim()).filter(Boolean)));
    const query = ids.length ? `?permissionIds=${encodeURIComponent(ids.join(','))}` : '';
    return apiClient.delete<RemovePermissionsResponse>(`${this.endpoints.USER_PERMISSIONS(id)}${query}`, options);
  }
}

export const userService = new UserService();
export default UserService;