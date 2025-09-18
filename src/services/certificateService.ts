import { API_CONFIG } from '@/lib/config';
import { apiClient } from '@/lib/api';
import { ApiResponse, Certificate, CreateCertificateRequest, PaginationQuery } from '@/types/api';

export class CertificateService {
  private client: typeof apiClient;

  constructor(client = apiClient) {
    this.client = client;
  }

  async list(params?: PaginationQuery & { userId?: string; courseId?: string; search?: string }): Promise<ApiResponse<Certificate[]>> {
    return this.client.get<Certificate[]>(API_CONFIG.ENDPOINTS.CERTIFICATES, params);
  }

  async getById(id: string): Promise<ApiResponse<Certificate>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CERTIFICATES}/${id}`;
    return this.client.get<Certificate>(endpoint);
  }

  async create(data: CreateCertificateRequest): Promise<ApiResponse<Certificate>> {
    return this.client.post<Certificate>(API_CONFIG.ENDPOINTS.CERTIFICATES, data);
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CERTIFICATES}/${id}`;
    return this.client.delete(endpoint);
  }

  async update(id: string, data: Partial<CreateCertificateRequest>): Promise<ApiResponse<Certificate>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CERTIFICATES}/${id}`;
    return this.client.patch<Certificate>(endpoint, data);
  }
}

export const certificateService = new CertificateService();
export default certificateService;
