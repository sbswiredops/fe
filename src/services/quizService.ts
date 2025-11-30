import { API_CONFIG } from "@/lib/config";
import { apiClient } from "@/lib/api";
import {
  ApiResponse,
  Quiz,
  CreateQuizRequest,
  UpdateQuizRequest,
  PaginationQuery,
} from "@/types/api";

export interface QuizQuestionPayload {
  id: string; // ensure each question has an id
  text: string;
  type: "mcq" | "multi" | "true_false" | "fill_blank" | "short";
  correctAnswer?: string;
  explanation?: string;
  options?: {
    id: string; // each option must have an id
    text: string;
    value?: string;
    isCorrect?: boolean;
  }[];
}

export type QuizSubmitPayload = Record<string, string | string[] | boolean> & {
  timeSpent?: number;
};

export interface QuizResultResponse {
  initialScore: number;
  autoGradableQuestions: number;
  pendingManualCheck: number;
}

export class QuizService {
  private client: typeof apiClient;

  constructor(client = apiClient) {
    this.client = client;
  }

  /* ---------------- QUIZ CRUD ---------------- */

  async list(
    params?: PaginationQuery & {
      search?: string;
      courseId?: string;
      sectionId?: string;
      status?: "active" | "inactive";
    }
  ): Promise<ApiResponse<Quiz[]>> {
    return this.client.get<Quiz[]>(API_CONFIG.ENDPOINTS.QUIZZES, params);
  }

  async listByCourse(
    courseId: string,
    params?: PaginationQuery
  ): Promise<ApiResponse<Quiz[]>> {
    return this.client.get<Quiz[]>(
      API_CONFIG.ENDPOINTS.COURSE_QUIZZES(courseId),
      params
    );
  }

  async listBySection(
    sectionId: string,
    params?: PaginationQuery
  ): Promise<ApiResponse<Quiz[]>> {
    return this.client.get<Quiz[]>(
      API_CONFIG.ENDPOINTS.SECTION_QUIZZES(sectionId),
      params
    );
  }

  async getById(id: string): Promise<ApiResponse<Quiz>> {
    return this.client.get<Quiz>(API_CONFIG.ENDPOINTS.QUIZ_BY_ID(id));
  }

  async create(
    data: CreateQuizRequest & { courseId?: string; sectionId?: string }
  ): Promise<ApiResponse<Quiz>> {
    if (data.sectionId) {
      const { sectionId, ...rest } = data;
      return this.client.post<Quiz>(
        API_CONFIG.ENDPOINTS.SECTION_QUIZZES(sectionId),
        rest
      );
    }
    if (data.courseId) {
      const { courseId, ...rest } = data;
      return this.client.post<Quiz>(
        API_CONFIG.ENDPOINTS.COURSE_QUIZZES(courseId),
        rest
      );
    }
    return this.client.post<Quiz>(API_CONFIG.ENDPOINTS.QUIZZES, data);
  }

  async update(id: string, data: UpdateQuizRequest): Promise<ApiResponse<Quiz>> {
    return this.client.patch<Quiz>(API_CONFIG.ENDPOINTS.QUIZ_BY_ID(id), data);
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    return this.client.delete(API_CONFIG.ENDPOINTS.QUIZ_BY_ID(id));
  }

  /* ---------------- QUESTIONS ---------------- */

  async getQuestions(
    quizId: string
  ): Promise<ApiResponse<QuizQuestionPayload[]>> {
    return this.client.get<QuizQuestionPayload[]>(
      API_CONFIG.ENDPOINTS.QUIZ_QUESTIONS(quizId)
    );
  }

  async addQuestions(
    quizId: string,
    payload: { questions: QuizQuestionPayload[] }
  ): Promise<ApiResponse<any>> {
    return this.client.post<any>(
      API_CONFIG.ENDPOINTS.QUIZ_QUESTIONS(quizId),
      payload
    );
  }

  async updateQuestion(
    questionId: string,
    payload: QuizQuestionPayload
  ): Promise<ApiResponse<any>> {
    return this.client.patch<any>(
      API_CONFIG.ENDPOINTS.QUIZ_QUESTION_BY_ID(questionId),
      payload
    );
  }

  async deleteQuestion(questionId: string): Promise<ApiResponse<any>> {
    return this.client.delete<any>(
      API_CONFIG.ENDPOINTS.QUIZ_QUESTION_BY_ID(questionId)
    );
  }

  /* ---------------- SUBMIT QUIZ ---------------- */

  async submitQuiz(
    quizId: string,
    answers: QuizSubmitPayload,
    timeSpent?: number // <-- add this parameter
  ): Promise<ApiResponse<QuizResultResponse>> {
    // Merge timeSpent into answers payload if provided
    const payload = timeSpent !== undefined ? { ...answers, timeSpent } : answers;
    return this.client.post<QuizResultResponse>(
      API_CONFIG.ENDPOINTS.QUIZ_SUBMIT(quizId),
      payload
    );
  }

  async unlockSectionQuiz(sectionId: string): Promise<ApiResponse<any>> {
    return this.client.post<any>(
      API_CONFIG.ENDPOINTS.UNLOCK_SECTION_QUIZ(sectionId),
      {}
    );
  }
  /* ---------------- GET QUIZ RESULT ---------------- */

  async getQuizResult(
    quizId: string
  ): Promise<ApiResponse<QuizResultResponse>> {
    return this.client.get<QuizResultResponse>(
      API_CONFIG.ENDPOINTS.QUIZ_SUBMIT(quizId)
    );
  }
}



export const quizService = new QuizService();
export default quizService;
