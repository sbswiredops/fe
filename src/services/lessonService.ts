import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import {
  ApiResponse,
  Lesson,
  CreateLessonRequest,
  UpdateLessonRequest,
  LessonsQuery,
} from '@/types/api';

export class LessonService {
  private client: typeof apiClient;

  constructor(client = apiClient) {
    this.client = client;
  }



  async getLessonPdfBlob(lessonId: string): Promise<Blob> {
    const response = await this.client.get<Blob>(
      API_CONFIG.ENDPOINTS.LESSON_PDF_BY_ID(lessonId),
      undefined,
      { responseType: 'blob' }
    );
    if (!response.data) {
      throw new Error('Failed to fetch lesson PDF');
    }
    return response.data;
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
      (data as any)?.video instanceof File ||
      (data as any)?.resource instanceof File;

    if (hasFile) {
      const form = new FormData();

      const appendValue = (key: string, value: unknown) => {
        if (value === undefined || value === null) return;
        if (value instanceof File) {
          form.append(key, value);
          return;
        }
        if (Array.isArray(value)) {
          form.append(key, JSON.stringify(value));
          return;
        }
        if (typeof value === 'boolean') {
          form.append(key, value ? 'true' : 'false');
          return;
        }
        form.append(key, String(value));
      };

      appendValue('sectionId', data.sectionId);
      appendValue('title', data.title);
      appendValue('content', data.content);
      appendValue('duration', typeof data.duration === 'number' ? data.duration : 0);
      appendValue('orderIndex', typeof data.orderIndex === 'number' ? data.orderIndex : 0);
      appendValue('isPublished', data.isPublished);
      appendValue('isFree', data.isFree);
      appendValue('video', (data as any).video);
      appendValue('resource', (data as any).resource);

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

    /* ---------------- LESSON PROGRESS ---------------- */

  // Get all progress of logged-in user
  async getAllLessonsProgress(): Promise<ApiResponse<any[]>> {
    return this.client.get<any[]>(API_CONFIG.ENDPOINTS.LESSONS_PROGRESS);
  }
 // Update specific lesson progress
  async updateProgress(
    lessonId: string,
    payload: { status: string }
  ): Promise<ApiResponse<any>> {
    return this.client.post<any>(
      API_CONFIG.ENDPOINTS.LESSON_PROGRESS(lessonId),
      payload
    );
  }
   // Admin: get specific user's lesson progress
  async getUserLessonProgress(
    userId: string
  ): Promise<ApiResponse<any[]>> {
    return this.client.get<any[]>(
      API_CONFIG.ENDPOINTS.USER_LESSONS_PROGRESS(userId)
    );
  }

  /** Update a lesson (supports file uploads) */
  async updateLesson(
    lessonId: string,
    data: UpdateLessonRequest
  ): Promise<ApiResponse<Lesson>> {
    const hasFile =
      (data as any)?.video instanceof File ||
      (data as any)?.resource instanceof File;

    if (hasFile) {
      const form = new FormData();

      const appendValue = (key: string, value: unknown) => {
        if (value === undefined || value === null) return;
        if (value instanceof File) {
          form.append(key, value);
          return;
        }
        if (Array.isArray(value)) {
          form.append(key, JSON.stringify(value));
          return;
        }
        if (typeof value === 'boolean') {
          form.append(key, value ? 'true' : 'false');
          return;
        }
        form.append(key, String(value));
      };

      appendValue('title', data.title);
      appendValue('content', data.content);
      if (data.duration !== undefined) appendValue('duration', data.duration);
      if (data.orderIndex !== undefined) appendValue('orderIndex', data.orderIndex);
      appendValue('isPublished', data.isPublished);
      appendValue('isFree', data.isFree);
      appendValue('video', (data as any).video);
      appendValue('resource', (data as any).resource);

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