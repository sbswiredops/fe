import { API_CONFIG } from '@/lib/config';
import { apiClient } from '@/lib/api';
import { ApiResponse, Quiz, CreateQuizRequest, UpdateQuizRequest, PaginationQuery } from '@/types/api';

export class QuizService {
  private client: typeof apiClient;

  constructor(client = apiClient) {
    this.client = client;
  }


  async list(params?: PaginationQuery & { search?: string; courseId?: string; sectionId?: string; status?: 'active' | 'inactive' }): Promise<ApiResponse<Quiz[]>> {
    return this.client.get<Quiz[]>(API_CONFIG.ENDPOINTS.QUIZZES, params);
  }

  async listByCourse(courseId: string, params?: PaginationQuery): Promise<ApiResponse<Quiz[]>> {
    try {
      return await this.client.get<Quiz[]>(API_CONFIG.ENDPOINTS.QUIZZES as any, { ...(params || {}), courseId });
    } catch {
      return this.client.get<Quiz[]>(API_CONFIG.ENDPOINTS.COURSE_QUIZZES(courseId), params);
    }
  }

  async listBySection(sectionId: string, params?: PaginationQuery): Promise<ApiResponse<Quiz[]>> {
    try {
      return await this.client.get<Quiz[]>(API_CONFIG.ENDPOINTS.QUIZZES as any, { ...(params || {}), sectionId });
    } catch {
      return this.client.get<Quiz[]>(API_CONFIG.ENDPOINTS.SECTION_QUIZZES(sectionId), params);
    }
  }

  async getById(id: string): Promise<ApiResponse<Quiz>> {
    return this.client.get<Quiz>(API_CONFIG.ENDPOINTS.QUIZ_BY_ID(id));
  }

  async create(data: (CreateQuizRequest & { courseId?: string; sectionId?: string })): Promise<ApiResponse<Quiz>> {
    if ((data as any).sectionId) {
      const { sectionId, ...rest } = data as any;
      return this.client.post<Quiz>(API_CONFIG.ENDPOINTS.SECTION_QUIZZES(sectionId), rest);
    }
    if ((data as any).courseId) {
      const { courseId, ...rest } = data as any;
      return this.client.post<Quiz>(API_CONFIG.ENDPOINTS.COURSE_QUIZZES(courseId), rest);
    }
    return this.client.post<Quiz>(API_CONFIG.ENDPOINTS.QUIZZES, data);
  }

  async update(id: string, data: UpdateQuizRequest): Promise<ApiResponse<Quiz>> {
    return this.client.patch<Quiz>(API_CONFIG.ENDPOINTS.QUIZ_BY_ID(id), data);
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    return this.client.delete(API_CONFIG.ENDPOINTS.QUIZ_BY_ID(id));
  }

  // List questions for a quiz
  async getQuestions(quizId: string): Promise<ApiResponse<any[]>> {
    return this.client.get<any[]>(API_CONFIG.ENDPOINTS.QUIZ_QUESTIONS(quizId));
  }

  // Add questions to a quiz (bulk)
  async addQuestions(quizId: string, payload: { questions: any[] }): Promise<ApiResponse<any>> {
    return this.client.post<any>(API_CONFIG.ENDPOINTS.QUIZ_QUESTIONS(quizId), payload);
  }

  // Update a single question
  async updateQuestion(questionId: string, payload: any): Promise<ApiResponse<any>> {
    return this.client.patch<any>(API_CONFIG.ENDPOINTS.QUIZ_QUESTION_BY_ID(questionId), payload);
  }

  // Delete a single question
  async deleteQuestion(questionId: string): Promise<ApiResponse<any>> {
    return this.client.delete<any>(API_CONFIG.ENDPOINTS.QUIZ_QUESTION_BY_ID(questionId));
  }
}

export const quizService = new QuizService();
export default quizService;
