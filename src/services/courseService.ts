import { apiClient, isApiConfigured } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseFilters,
  EnrollmentRequest,
  ApiResponse,
  PaginationQuery
} from '@/types/api';

export class CourseService {
  private client: typeof apiClient;

  constructor(client = apiClient) {
    this.client = client;
  }

  // Get all courses with filtering and pagination
  async getCourses(params?: CourseFilters): Promise<ApiResponse<Course[]>> {
    if (!isApiConfigured()) {
      return { success: true, data: [] } as ApiResponse<Course[]>;
    }
    return this.client.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES, params);
  }

  // Get courses by type
  async getCoursesByType(
    type: string,
    params?: PaginationQuery
  ): Promise<ApiResponse<{ courses: Course[]; total: number; page: number; limit: number }>> {
    if (!isApiConfigured()) {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
      return { success: true, data: { courses: [], total: 0, page, limit } };
    }
    return this.client.get<{ courses: Course[]; total: number; page: number; limit: number }>(
      API_CONFIG.ENDPOINTS.COURSES_BY_TYPE(type),
      params
    );
  }

  // Get featured courses
  async getFeaturedCourses(params?: PaginationQuery & {
    categoryId?: string;
    level?: string;
    priceMin?: number;
    priceMax?: number;
  }): Promise<ApiResponse<Course[]>> {
    if (!isApiConfigured()) {
      return { success: true, data: [] } as ApiResponse<Course[]>;
    }
    return this.client.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES_FEATURED, params);
  }

  // Get course by ID
  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    console.log('[CourseService] getCourseById called with id:', id);
    const response = await this.client.get<Course>(API_CONFIG.ENDPOINTS.COURSE_BY_ID(id));
    console.log('[CourseService] getCourseById response:', response);
    return response;
  }

  // Get course by SKU
  async getCourseBySku(sku: string): Promise<ApiResponse<Course>> {
    console.log('[CourseService] getCourseBySku called with sku:', sku);
    const response = await this.client.get<Course>(API_CONFIG.ENDPOINTS.COURSE_BY_SKU(sku));
    console.log('[CourseService] getCourseBySku response:', response);
    return response;
  }

  async createCourse(courseData: CreateCourseRequest | FormData): Promise<ApiResponse<Course>> {
    if (typeof FormData !== "undefined" && courseData instanceof FormData) {
      return this.client.post<Course>(API_CONFIG.ENDPOINTS.COURSES, courseData);
    }
    const payload = courseData as any;
    const hasFile = payload && Object.values(payload).some((v: any) =>
      typeof v === 'object' && v !== null && (v instanceof File || (typeof (v as any).name === 'string' && typeof (v as any).size === 'number'))
    );

    if (hasFile) {
      const form = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof File) {
          form.append(k, v);
          return;
        }
        if (Array.isArray(v) && v.length > 0 && v[0] instanceof File) {
          (v as File[]).forEach((f: File) => form.append(k, f));
          return;
        }

        // Arrays and objects -> JSON string
        if (Array.isArray(v) || (typeof v === 'object' && v !== null)) {
          form.append(k, JSON.stringify(v));
          return;
        }

        // Primitives (number/boolean/string) -> string
        form.append(k, String(v));
      });
      try {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
          console.groupCollapsed('[CourseService] FormData to POST');
          for (const entry of (form as any).entries()) {
            const [key, value] = entry as [string, any];
            if (value instanceof File) {
              console.log(key, { name: value.name, size: value.size, type: value.type });
            } else {
              console.log(key, value);
            }
          }
          console.groupEnd();
        }
      } catch {
        // ignore logging failures
      }

      return this.client.post<Course>(API_CONFIG.ENDPOINTS.COURSES, form);
    }

    return this.client.post<Course>(API_CONFIG.ENDPOINTS.COURSES, courseData as CreateCourseRequest);
  }

  // Update course
  async updateCourse(id: string, courseData: UpdateCourseRequest): Promise<ApiResponse<Course>> {
    // If caller provided a FormData (e.g. page built it), forward as-is
    if (typeof FormData !== "undefined" && courseData instanceof FormData) {
      return this.client.patch<Course>(API_CONFIG.ENDPOINTS.COURSE_BY_ID(id), courseData);
    }

    const payload = courseData as any;
    const hasFile = payload && Object.values(payload).some((v: any) =>
      typeof v === 'object' && v !== null && (v instanceof File || (typeof (v as any).name === 'string' && typeof (v as any).size === 'number'))
    );

    if (hasFile) {
      const form = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof File) {
          form.append(k, v);
          return;
        }
        if (Array.isArray(v) && v.length > 0 && v[0] instanceof File) {
          (v as File[]).forEach((f: File) => form.append(k, f));
          return;
        }

        if (Array.isArray(v) || (typeof v === 'object' && v !== null)) {
          form.append(k, JSON.stringify(v));
          return;
        }

        form.append(k, String(v));
      });

      // Development-only: log FormData contents to help debugging multipart encoding
      try {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
          console.groupCollapsed('[CourseService] FormData to PATCH');
          for (const entry of (form as any).entries()) {
            const [key, value] = entry as [string, any];
            if (value instanceof File) {
              console.log(key, { name: value.name, size: value.size, type: value.type });
            } else {
              console.log(key, value);
            }
          }
          console.groupEnd();
        }
      } catch {
        // ignore logging failures
      }

      return this.client.patch<Course>(API_CONFIG.ENDPOINTS.COURSE_BY_ID(id), form);
    }

    return this.client.patch<Course>(API_CONFIG.ENDPOINTS.COURSE_BY_ID(id), courseData as UpdateCourseRequest);
  }

  // Delete course
  async deleteCourse(id: string): Promise<ApiResponse<null>> {
    return this.client.delete(API_CONFIG.ENDPOINTS.COURSE_BY_ID(id));
  }

  // Enroll in a course
  async enrollInCourse(id: string, enrollmentData: EnrollmentRequest): Promise<ApiResponse<any>> {
    return this.client.post(API_CONFIG.ENDPOINTS.COURSE_ENROLL(id), enrollmentData);
  }

  // Get course progress
  async getCourseProgress(id: string): Promise<ApiResponse<any>> {
    return this.client.get(API_CONFIG.ENDPOINTS.COURSE_PROGRESS(id));
  }

  // Get course enrollment info
  async getCourseEnrollmentInfo(id: string): Promise<ApiResponse<any>> {
    return this.client.get(API_CONFIG.ENDPOINTS.COURSE_ENROLL_INFO(id));
  }

  // Upload course thumbnail
  async uploadCourseThumbnail(
    id: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<any>> {
    return this.client.upload(API_CONFIG.ENDPOINTS.COURSE_UPLOAD_THUMBNAIL(id), file, onProgress);
  }

  // Search courses
  async searchCourses(searchTerm: string, params?: CourseFilters): Promise<ApiResponse<Course[]>> {
    return this.getCourses({ ...params, search: searchTerm });
  }

  // Get courses by category
  async getCoursesByCategory(categoryId: string, params?: PaginationQuery): Promise<ApiResponse<Course[]>> {
    return this.getCourses({ ...params, categoryId });
  }

  // Get courses by instructor
  async getCoursesByInstructor(instructorId: string, params?: PaginationQuery): Promise<ApiResponse<Course[]>> {
    return this.getCourses({ ...params, instructorId });
  }

  // Get courses by level
  async getCoursesByLevel(level: 'beginner' | 'intermediate' | 'advanced', params?: PaginationQuery): Promise<ApiResponse<Course[]>> {
    return this.getCourses({ ...params, level });
  }

  // Get published courses only
  async getPublishedCourses(params?: CourseFilters): Promise<ApiResponse<{ courses: Course[]; total: number; page: number; limit: number }>> {
    if (!isApiConfigured()) {
      const page = (params as any)?.page ?? 1;
      const limit = (params as any)?.limit ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
      return { success: true, data: { courses: [], total: 0, page, limit } };
    }

    return this.client.get<{ courses: Course[]; total: number; page: number; limit: number }>(
      API_CONFIG.ENDPOINTS.COURSES,
      { ...params, status: 'published' }
    );
  }


  // Update course status
  async updateCourseStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<ApiResponse<Course>> {
    return this.updateCourse(id, { status });
  }

  // Toggle course featured status
  async toggleFeatured(id: string, featured: boolean): Promise<ApiResponse<Course>> {
    return this.updateCourse(id, { featured });
  }

  // Update course price
  async updateCoursePrice(id: string, price: number, originalPrice?: number): Promise<ApiResponse<Course>> {
    return this.updateCourse(id, { price, originalPrice });
  }

  // Bulk update course status
  async bulkUpdateCourseStatus(courseIds: string[], status: 'draft' | 'published' | 'archived'): Promise<ApiResponse<any>> {
    const updatePromises = courseIds.map(id => this.updateCourseStatus(id, status));
    const results = await Promise.allSettled(updatePromises);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: failed === 0,
      data: { successful, failed, total: courseIds.length },
      message: failed === 0
        ? `Successfully updated ${successful} courses`
        : `Updated ${successful} courses, failed to update ${failed} courses`
    };
  }

  // Bulk delete courses
  async bulkDeleteCourses(courseIds: string[]): Promise<ApiResponse<any>> {
    const deletePromises = courseIds.map(id => this.deleteCourse(id));
    const results = await Promise.allSettled(deletePromises);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: failed === 0,
      data: { successful, failed, total: courseIds.length },
      message: failed === 0
        ? `Successfully deleted ${successful} courses`
        : `Deleted ${successful} courses, failed to delete ${failed} courses`
    };
  }

  // Get course statistics
  async getCourseStats(): Promise<ApiResponse<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    featured: number;
    totalEnrollments: number;
    averageRating: number;
    totalRevenue: number;
  }>> {
    try {
      const response = await this.getCourses({ limit: 1000 });
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch courses for statistics');
      }

      const courses = response.data;
      const stats = {
        total: courses.length,
        published: courses.filter(c => c.status === 'published').length,
        draft: courses.filter(c => c.status === 'draft').length,
        archived: courses.filter(c => c.status === 'archived').length,
        featured: courses.filter(c => c.featured).length,
        totalEnrollments: courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
        averageRating: courses.length > 0
          ? courses.reduce((sum, c) => sum + c.rating, 0) / courses.length
          : 0,
        totalRevenue: courses.reduce((sum, c) => sum + (c.price * c.enrollmentCount), 0)
      };

      return { success: true, data: stats, message: 'Course statistics retrieved successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get course statistics'
      };
    }
  }

  // Get popular courses (by enrollment count)
  async getPopularCourses(params?: PaginationQuery): Promise<ApiResponse<Course[]>> {
    return this.getCourses({
      ...params,
      sortBy: 'enrollmentCount',
      sortOrder: 'desc',
      status: 'published'
    });
  }

  // Get top rated courses
  async getTopRatedCourses(params?: PaginationQuery): Promise<ApiResponse<Course[]>> {
    return this.getCourses({
      ...params,
      sortBy: 'rating',
      sortOrder: 'desc',
      status: 'published'
    });
  }

  // Get newest courses
  async getNewestCourses(params?: PaginationQuery): Promise<ApiResponse<Course[]>> {
    return this.getCourses({
      ...params,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'published'
    });
  }

  // Get courses in price range
  async getCoursesInPriceRange(
    priceMin: number,
    priceMax: number,
    params?: PaginationQuery
  ): Promise<ApiResponse<Course[]>> {
    return this.getCourses({
      ...params,
      priceMin,
      priceMax,
      status: 'published'
    });
  }

  // Get free courses
  async getFreeCourses(params?: PaginationQuery): Promise<ApiResponse<Course[]>> {
    return this.getCoursesInPriceRange(0, 0, params);
  }

  // Clone course
  async cloneCourse(id: string, newTitle?: string): Promise<ApiResponse<Course>> {
    try {
      const response = await this.getCourseById(id);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch course to clone');
      }

      const originalCourse = response.data;
      const cloneTitle = newTitle || `${originalCourse.title} (Copy)`;

      const cloneData: CreateCourseRequest = {
        title: cloneTitle,
        description: originalCourse.description,
        categoryId: originalCourse.categoryId,
        instructorId: originalCourse.instructorId,
        price: originalCourse.price,
        originalPrice: originalCourse.originalPrice,
        duration: originalCourse.duration,
        level: originalCourse.level,
        language: originalCourse.language,
        status: 'draft',
        featured: false,
        tags: originalCourse.tags,
        requirements: originalCourse.requirements,
        whatYouWillLearn: originalCourse.whatYouWillLearn
      };

      return this.createCourse(cloneData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clone course'
      };
    }
  }

  // Validate course title availability
  async validateCourseTitle(title: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      const response = await this.searchCourses(title);
      if (!response.success || !response.data) {
        throw new Error('Failed to validate course title');
      }
      const existingCourses = response.data.filter(course =>
        course.title.toLowerCase() === title.toLowerCase() && course.id !== excludeId
      );
      return {
        success: true,
        data: { available: existingCourses.length === 0 },
        message: existingCourses.length === 0
          ? 'Course title is available'
          : 'Course title already exists'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate course title'
      };
    }
  }
}

export const courseService = new CourseService();
export default courseService;
