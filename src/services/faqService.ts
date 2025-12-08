import { apiClient, isApiConfigured } from "@/lib/api";
import { API_CONFIG } from "@/lib/config";
import { ApiResponse } from "@/types/api";

export class FaqService {
    private client: typeof apiClient;

    constructor(client = apiClient) {
        this.client = client;
    }

    async createFaq(courseId: string, data: any): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: "API not configured" };
        return this.client.post(API_CONFIG.ENDPOINTS.COURSE_CREATE_FAQ(courseId), data);
    }

    async listFaqs(courseId: string): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: true, data: [] };
        return this.client.get(API_CONFIG.ENDPOINTS.COURSE_LIST_FAQS(courseId));
    }

    async getFaqById(faqId: string): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: "API not configured" };
        return this.client.get(API_CONFIG.ENDPOINTS.COURSE_FAQ_BY_ID(faqId));
    }

    async updateFaq(faqId: string, data: any): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: "API not configured" };
        return this.client.patch(API_CONFIG.ENDPOINTS.COURSE_UPDATE_FAQ(faqId), data);
    }

    async deleteFaq(faqId: string): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: "API not configured" };
        return this.client.delete(API_CONFIG.ENDPOINTS.COURSE_DELETE_FAQ(faqId));
    }
}

export const faqService = new FaqService();
export default faqService;