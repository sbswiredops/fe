import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import { ApiResponse } from '@/types/api';

// Role Types
export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystemRole: boolean;
    createdAt: string;
    updatedAt: string;
    users?: RoleUser[];
}

export interface RoleUser {
    id: string;
    name: string;
    email: string;
}

export interface CreateRoleRequest {
    name: string;
    description: string;
    permissions: string[];
}

export interface UpdateRoleRequest {
    description?: string;
    permissions?: string[];
}

export interface AssignPermissionsRequest {
    permissions: string[];
}

export interface RolesListResponse {
    success: boolean;
    data: Role[];
}

export interface SingleRoleResponse {
    success: boolean;
    data: Role;
}

export interface CreateRoleResponse {
    success: boolean;
    message: string;
    data: Role;
}

export interface UpdateRoleResponse {
    success: boolean;
    message: string;
    data: Role;
}

export interface DeleteRoleResponse {
    success: boolean;
    message: string;
}

export interface PermissionsListResponse {
    success: boolean;
    data: string[];
}

export interface AssignPermissionsResponse {
    success: boolean;
    message: string;
    data: {
        role: Role;
        assignedPermissions: string[];
    };
}

/**
 * Get all roles
 * @returns List of all roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>(
        API_CONFIG.ENDPOINTS.ROLES_LIST
    );

    return response.data!;
};


/**
 * Get all available permissions
 * @returns List of all available permissions
 */
export const getAllPermissions = async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(
        API_CONFIG.ENDPOINTS.ROLES_PERMISSIONS_LIST
    );
    return response.data!;
};
/**
 * Get single role by ID
 * @param id - Role ID
 * @returns Role details with assigned users
 */
export const getRoleById = async (id: string): Promise<SingleRoleResponse> => {
    const response = await apiClient.get<SingleRoleResponse>(
        API_CONFIG.ENDPOINTS.ROLE_GET(id)
    );
    return response.data!;
};

/**
 * Create a new role
 * @param data - Role creation data
 * @returns Created role
 */
export const createRole = async (
    data: CreateRoleRequest
): Promise<CreateRoleResponse> => {
    const response = await apiClient.post<CreateRoleResponse>(
        API_CONFIG.ENDPOINTS.ROLES_CREATE,
        data
    );
    return response.data!;
};

/**
 * Update an existing role
 * @param id - Role ID
 * @param data - Role update data
 * @returns Updated role
 */
export const updateRole = async (
    id: string,
    data: UpdateRoleRequest
): Promise<UpdateRoleResponse> => {
    const response = await apiClient.patch<UpdateRoleResponse>(
        API_CONFIG.ENDPOINTS.ROLE_UPDATE(id),
        data
    );
    return response.data!;
};

/**
 * Delete a role
 * @param id - Role ID
 * @returns Deletion confirmation
 */
export const deleteRole = async (id: string): Promise<DeleteRoleResponse> => {
    const response = await apiClient.delete<DeleteRoleResponse>(
        API_CONFIG.ENDPOINTS.ROLE_DELETE(id)
    );
    return response.data!;
};



/**
 * Assign permissions to a role
 * @param id - Role ID
 * @param data - Permissions to assign
 * @returns Updated role with assigned permissions
 */
export const assignPermissionsToRole = async (
    id: string,
    data: AssignPermissionsRequest
): Promise<AssignPermissionsResponse> => {
    const response = await apiClient.post<AssignPermissionsResponse>(
        API_CONFIG.ENDPOINTS.ROLE_ASSIGN_PERMISSIONS(id),
        data
    );
    return response.data!;
};

/**
 * Format permission string to user-friendly label
 * @param permission - Permission string (e.g., "create:user")
 * @returns Formatted label (e.g., "Create Users")
 */
export const formatPermissionLabel = (permission: string): string => {
    const parts = permission.split(':');
    const action = parts[0];
    const resource = parts.slice(1).join(':'); // Handles multi-part resource

    const actionLabels: Record<string, string> = {
        create: 'Create',
        read: 'View',
        update: 'Edit',
        delete: 'Delete',
        assign: 'Assign',
        process: 'Process',
        publish: 'Publish',
        enroll: 'Enroll',
        upload: 'Upload',
        search: 'Search',
        manage: 'Manage',
        mark: 'Mark',
        archive: 'Archive',
        submit: 'Submit',
    };

    const resourceLabels: Record<string, string> = {
        user: 'Users',
        role: 'Roles',
        course: 'Courses',
        category: 'Categories',
        payment: 'Payments',
        refund: 'Refunds',
        analytics: 'Analytics',
        dashboard: 'Dashboard',
        reports: 'Reports',
        profile: 'Profile',
        avatar: 'Avatar',
        global: 'Global',
        logs: 'Logs',
        system: 'System',
        lesson: 'Lessons',
        section: 'Sections',
        quiz: 'Quizzes',
        faq: 'FAQs',
        contact: 'Contact',
        certificate: 'Certificates',
        // Add more if needed
        'user:role': 'User Roles',
        'user:permissions': 'User Permissions',
        'role:permissions': 'Role Permissions',
        'contact:read': 'Contact Read',
        'contact:archive': 'Contact Archive',
        'role:assign:permissions': 'Assign Role Permissions',
        // etc.
    };

    const actionLabel = actionLabels[action] || action;
    const resourceLabel = resourceLabels[resource] || resource;

    return `${actionLabel} ${resourceLabel}`;
};

/**
 * Group permissions by category
 */
export const permissionCategories: Record<string, string[]> = {
    'User Management': [
        'create:user',
        'read:user',
        'update:user',
        'delete:user',
        'update:user:role',
        'update:user:permissions',
    ],
    'Role Management': [
        'create:role',
        'read:role',
        'update:role',
        'delete:role',
        'assign:role:permissions',
    ],
    'Course Management': [
        'create:course',
        'read:course',
        'update:course',
        'delete:course',
        'publish:course',
        'enroll:course',
    ],
    'Category Management': [
        'create:category',
        'read:category',
        'update:category',
        'delete:category',
    ],
    'Payment Management': [
        'create:payment',
        'read:payment',
        'update:payment',
        'delete:payment',
        'process:refund',
    ],
    'Lesson Management': [
        'create:lesson',
        'read:lesson',
        'update:lesson',
        'delete:lesson',
    ],
    'Section Management': [
        'create:section',
        'read:section',
        'update:section',
        'delete:section',
    ],
    'Quiz Management': [
        'create:quiz',
        'read:quiz',
        'update:quiz',
        'delete:quiz',
        'submit:quiz',
    ],
    'FAQ Management': [
        'create:faq',
        'read:faq',
        'update:faq',
        'delete:faq',
    ],
    'Contact Management': [
        'create:contact',
        'read:contact',
        'update:contact',
        'delete:contact',
        'mark:contact:read',
        'archive:contact',
    ],
    'Certificate Management': [
        'create:certificate',
        'read:certificate',
        'update:certificate',
        'delete:certificate',
    ],
    'Dashboard & Analytics': [
        'read:analytics',
        'read:dashboard',
        'read:reports',
    ],
    'Profile Management': [
        'read:profile',
        'update:profile',
        'delete:profile',
        'upload:avatar',
    ],
    'Admin Functions': [
        'read:logs',
        'manage:system',
    ],
    'Search': [
        'search:global',
    ],
};

/**
 * Get grouped permissions for UI display
 * @param allPermissions - List of all permissions
 * @returns Permissions grouped by category
 */
export const getGroupedPermissions = (
    allPermissions: string[]
): Record<string, string[]> => {
    const grouped: Record<string, string[]> = {};

    Object.entries(permissionCategories).forEach(([category, permissions]) => {
        const availablePermissions = permissions.filter((p) =>
            allPermissions.includes(p)
        );
        if (availablePermissions.length > 0) {
            grouped[category] = availablePermissions;
        }
    });

    return grouped;
};

/**
 * Validate role name format
 * @param name - Role name to validate
 * @returns True if valid, error message if invalid
 */
export const validateRoleName = (name: string): true | string => {
    if (!name || name.trim().length === 0) {
        return 'Role name is required';
    }

    if (name.length < 3) {
        return 'Role name must be at least 3 characters';
    }

    if (name.length > 50) {
        return 'Role name must not exceed 50 characters';
    }

    const roleNameRegex = /^[a-z0-9_]+$/;
    if (!roleNameRegex.test(name)) {
        return 'Role name must contain only lowercase letters, numbers, and underscores';
    }

    return true;
};

/**
 * Validate role description
 * @param description - Role description to validate
 * @returns True if valid, error message if invalid
 */
export const validateRoleDescription = (description: string): true | string => {
    if (!description || description.trim().length === 0) {
        return 'Role description is required';
    }

    if (description.length < 10) {
        return 'Role description must be at least 10 characters';
    }

    if (description.length > 500) {
        return 'Role description must not exceed 500 characters';
    }

    return true;
};

/**
 * Validate permissions selection
 * @param permissions - Selected permissions
 * @returns True if valid, error message if invalid
 */
export const validatePermissions = (permissions: string[]): true | string => {
    if (!permissions || permissions.length === 0) {
        return 'At least one permission must be selected';
    }

    return true;
};
