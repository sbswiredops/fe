import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import {
  ApiResponse,
  Section,
  CreateSectionRequest,
  UpdateSectionRequest,
  PaginationQuery,
} from '@/types/api';

export class SectionService {
  private client: typeof apiClient;

  constructor(client = apiClient) {
    this.client = client;
  }

  /** List all sections */
  async listAll(params?: PaginationQuery): Promise<ApiResponse<Section[]>> {
    return this.client.get<Section[]>(API_CONFIG.ENDPOINTS.SECTIONS, params);
  }

  /** List sections for a course (prefer global filterable endpoint) */
  async listByCourse(courseId: string, params?: PaginationQuery): Promise<ApiResponse<Section[]>> {
    try {
      // Try global endpoint with filter first
      return await this.client.get<Section[]>(API_CONFIG.ENDPOINTS.SECTIONS as any, { ...(params || {}), courseId });
    } catch {
      // Fallback to nested route if available on older backends
      return this.client.get<Section[]>(API_CONFIG.ENDPOINTS.COURSE_SECTIONS(courseId), params);
    }
  }

  /** Get a section by ID */
  async getById(sectionId: string): Promise<ApiResponse<Section>> {
    return this.client.get<Section>(API_CONFIG.ENDPOINTS.SECTION_BY_ID(sectionId));
  }

  /** Create a section under a course */
  async createSection(courseId: string, data: CreateSectionRequest): Promise<ApiResponse<Section>> {
    return this.client.post<Section>(API_CONFIG.ENDPOINTS.COURSE_SECTIONS(courseId), data);
  }

  /** Update a section */
  async updateSection(sectionId: string, data: UpdateSectionRequest): Promise<ApiResponse<Section>> {
    return this.client.patch<Section>(API_CONFIG.ENDPOINTS.SECTION_BY_ID(sectionId), data);
  }

  /** Delete a section */
  async deleteSection(sectionId: string): Promise<ApiResponse<null>> {
    return this.client.delete(API_CONFIG.ENDPOINTS.SECTION_BY_ID(sectionId));
  }
}

export const sectionService = new SectionService();
export default sectionService;
