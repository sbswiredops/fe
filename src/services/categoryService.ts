import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponse,
  PaginationQuery
} from '@/types/api';

export class CategoryService {
  /**
   * Get all categories with pagination and filtering
   */
  async getCategories(params?: PaginationQuery & {
    search?: string;
    status?: string;
    featured?: boolean;
    parentId?: string;
  }): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES, params);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id));
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    const hasFile =
      (categoryData as any)?.categories_avatar instanceof File ||
      (categoryData as any)?.icon instanceof File;

    if (hasFile) {
      const form = new FormData();
      Object.entries(categoryData as any).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof File) {
          form.append(k, v);
        } else {
          form.append(k, String(v));
        }
      });
      return apiClient.post<Category>(API_CONFIG.ENDPOINTS.CATEGORIES, form);
    }

    return apiClient.post<Category>(API_CONFIG.ENDPOINTS.CATEGORIES, categoryData);
  }

  /**
   * Update category
   */
  async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    const hasFile =
      (categoryData as any)?.categories_avatar instanceof File ||
      (categoryData as any)?.icon instanceof File;

    if (hasFile) {
      const form = new FormData();
      Object.entries(categoryData as any).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof File) {
          form.append(k, v);
        } else {
          form.append(k, String(v));
        }
      });
      return apiClient.patch<Category>(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), form);
    }

    return apiClient.patch<Category>(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), categoryData);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id));
  }

  /**
   * Get root categories (no parent)
   */
  async getRootCategories(params?: PaginationQuery): Promise<ApiResponse<Category[]>> {
    return this.getCategories({ ...params, parentId: '' });
  }

  /**
   * Get subcategories of a parent category
   */
  async getSubcategories(parentId: string, params?: PaginationQuery): Promise<ApiResponse<Category[]>> {
    return this.getCategories({ ...params, parentId });
  }

  /**
   * Get featured categories
   */
  async getFeaturedCategories(params?: PaginationQuery): Promise<ApiResponse<Category[]>> {
    return this.getCategories({ ...params, featured: true });
  }

  /**
   * Get active categories
   */
  async getActiveCategories(params?: PaginationQuery): Promise<ApiResponse<Category[]>> {
    return this.getCategories({ ...params, status: 'active' });
  }

  /**
   * Search categories
   */
  async searchCategories(searchTerm: string, params?: PaginationQuery): Promise<ApiResponse<Category[]>> {
    return this.getCategories({ ...params, search: searchTerm });
  }

  /**
   * Update category status
   */
  async updateCategoryStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<Category>> {
    return this.updateCategory(id, { status });
  }

  /**
   * Toggle category featured status
   */
  async toggleFeatured(id: string, featured: boolean): Promise<ApiResponse<Category>> {
    return this.updateCategory(id, { featured });
  }

  /**
   * Reorder categories
   */
  async reorderCategories(categoryOrders: { id: string; order: number }[]): Promise<ApiResponse<any>> {
    const updatePromises = categoryOrders.map(({ id, order }) =>
      this.updateCategory(id, { order })
    );

    const results = await Promise.allSettled(updatePromises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      success: failed === 0,
      data: {
        successful,
        failed,
        total: categoryOrders.length
      },
      message: failed === 0
        ? `Successfully reordered ${successful} categories`
        : `Reordered ${successful} categories, failed to reorder ${failed} categories`
    };
  }

  /**
   * Bulk delete categories
   */
  async bulkDeleteCategories(categoryIds: string[]): Promise<ApiResponse<any>> {
    const deletePromises = categoryIds.map(id => this.deleteCategory(id));
    const results = await Promise.allSettled(deletePromises);

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return {
      success: failed === 0,
      data: {
        successful,
        failed,
        total: categoryIds.length
      },
      message: failed === 0
        ? `Successfully deleted ${successful} categories`
        : `Deleted ${successful} categories, failed to delete ${failed} categories`
    };
  }

  /**
   * Get category hierarchy (tree structure)
   */
  async getCategoryHierarchy(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await this.getCategories({ limit: 1000, sortBy: 'order', sortOrder: 'asc' });
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch categories');
      }

      const allCategories = response.data;

      // Build hierarchy
      const rootCategories = allCategories.filter(cat => !cat.parentId);
      const hierarchy = rootCategories.map(rootCat => {
        const subcategories = allCategories.filter(cat => cat.parentId === rootCat.id);
        return {
          ...rootCat,
          subcategories
        };
      });

      return {
        success: true,
        data: hierarchy,
        message: 'Category hierarchy retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get category hierarchy'
      };
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    featured: number;
    rootCategories: number;
    subcategories: number;
    totalCourses: number;
  }>> {
    try {
      const response = await this.getCategories({ limit: 1000 });
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch categories for statistics');
      }

      const categories = response.data;
      const stats = {
        total: categories.length,
        active: categories.filter(cat => cat.status === 'active').length,
        inactive: categories.filter(cat => cat.status === 'inactive').length,
        featured: categories.filter(cat => cat.featured).length,
        rootCategories: categories.filter(cat => !cat.parentId).length,
        subcategories: categories.filter(cat => cat.parentId).length,
        totalCourses: categories.reduce((sum, cat) => sum + cat.courseCount, 0)
      };

      return {
        success: true,
        data: stats,
        message: 'Category statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get category statistics'
      };
    }
  }

  /**
   * Validate category name availability
   */
  async validateCategoryName(name: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      const response = await this.searchCategories(name);
      if (!response.success || !response.data) {
        throw new Error('Failed to validate category name');
      }

      const existingCategories = response.data.filter(cat =>
        cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId
      );

      return {
        success: true,
        data: { available: existingCategories.length === 0 },
        message: existingCategories.length === 0
          ? 'Category name is available'
          : 'Category name already exists'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate category name'
      };
    }
  }

  /**
   * Move category to different parent
   */
  async moveCategory(id: string, newParentId?: string): Promise<ApiResponse<Category>> {
    return this.updateCategory(id, { parentId: newParentId });
  }

  /**
   * Clone category
   */
  async cloneCategory(id: string, newName?: string): Promise<ApiResponse<Category>> {
    try {
      const response = await this.getCategoryById(id);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch category to clone');
      }

      const originalCategory = response.data;
      const cloneName = newName || `${originalCategory.name} (Copy)`;

      const cloneData: CreateCategoryRequest = {
        name: cloneName,
        description: originalCategory.description,
        parentId: originalCategory.parentId,
        icon: originalCategory.icon,
        featured: false, // Clones are not featured by default
        status: 'inactive', // Clones are inactive by default
        order: originalCategory.order + 1
      };

      return this.createCategory(cloneData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clone category'
      };
    }
  }
}

export const categoryService = new CategoryService();
export default CategoryService;