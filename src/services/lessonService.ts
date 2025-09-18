import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import {
  ApiResponse,
  Lesson,
  CreateLessonRequest,
  UpdateLessonRequest,
  PaginationQuery,
  LessonsQuery, // added
} from '@/types/api';

export class LessonService {
  private client: typeof apiClient;

  constructor(client = apiClient) {
    this.client = client;
  }

  // Update: accept wider query with search/courseId/sectionId
  async getLessons(params?: LessonsQuery): Promise<ApiResponse<Lesson[]>> {
    return this.client.get<Lesson[]>(API_CONFIG.ENDPOINTS.ALL_LESSIONS, params);
  }

  /** Get lessons by section */
  async getLessonsBySection(
    sectionId: string,
    params?: LessonsQuery // widened for consistency
  ): Promise<ApiResponse<Lesson[]>> {
    try {
      return await this.client.get<Lesson[]>(
        API_CONFIG.ENDPOINTS.LESSONS_BY_SECTION(sectionId),
        params
      );
    } catch (e) {
      // Fallback to global lessons endpoint with sectionId filter
      const endpoint = (API_CONFIG.ENDPOINTS as any).ALL_LESSONS || (API_CONFIG.ENDPOINTS as any).ALL_LESSONS;
      if (endpoint) {
        return this.client.get<Lesson[]>(endpoint, { ...(params || {}), sectionId });
      }
      throw e;
    }
  }

  /** Get lesson by ID */
  async getLessonById(lessonId: string): Promise<ApiResponse<Lesson>> {
    return this.client.get<Lesson>(API_CONFIG.ENDPOINTS.LESSON_BY_ID(lessonId));
  }

  /** Create a lesson under a section (supports file uploads) */
  async createLesson(
    sectionId: string,
    data: CreateLessonRequest
  ): Promise<ApiResponse<Lesson>> {
    const hasFile =
      (data as any)?.videoUrl instanceof File ||
      (data as any)?.resourceUrl instanceof File;

    if (hasFile) {
      const form = new FormData();
      Object.entries(data as any).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof File) form.append(k, v);
        else if (Array.isArray(v)) form.append(k, JSON.stringify(v));
        else form.append(k, String(v as any));
      });
      return this.client.post<Lesson>(
        API_CONFIG.ENDPOINTS.LESSONS_BY_SECTION(sectionId),
        form
      );
    }

    return this.client.post<Lesson>(
      API_CONFIG.ENDPOINTS.LESSONS_BY_SECTION(sectionId),
      data
    );
  }

  /** Update a lesson (supports file uploads) */
  async updateLesson(
    lessonId: string,
    data: UpdateLessonRequest
  ): Promise<ApiResponse<Lesson>> {
    const hasFile =
      (data as any)?.videoUrl instanceof File ||
      (data as any)?.resourceUrl instanceof File;

    if (hasFile) {
      const form = new FormData();
      Object.entries(data as any).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof File) form.append(k, v);
        else if (Array.isArray(v)) form.append(k, JSON.stringify(v));
        else form.append(k, String(v as any));
      });
      return this.client.patch<Lesson>(
        API_CONFIG.ENDPOINTS.LESSON_BY_ID(lessonId),
        form
      );
    }

    return this.client.patch<Lesson>(
      API_CONFIG.ENDPOINTS.LESSON_BY_ID(lessonId),
      data
    );
  }

  /** Delete a lesson */
  async deleteLesson(lessonId: string): Promise<ApiResponse<null>> {
    return this.client.delete(API_CONFIG.ENDPOINTS.LESSON_BY_ID(lessonId));
  }
}

export const lessonService = new LessonService();
export default lessonService;