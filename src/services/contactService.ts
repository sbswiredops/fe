import { apiClient, isApiConfigured } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import { ApiResponse } from '@/types/api';

export class ContactService {
    private client: typeof apiClient;

    constructor(client = apiClient) {
        this.client = client;
    }

    // Create a contact message (public)
    async createContact(data: any): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) {
            // API not configured (local/dev). Return simulated success so UI can behave predictably
            return { success: true, data: null, message: 'Simulated success (API not configured)' } as ApiResponse<any>;
        }

        return this.client.post(API_CONFIG.ENDPOINTS.CONTACTS, data);
    }

    // List contact messages (admin)
    async listContacts(params?: Record<string, any>): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: true, data: [] } as ApiResponse<any>;
        return this.client.get(API_CONFIG.ENDPOINTS.CONTACTS, params);
    }

    // Get contact by ID (admin)
    async getContactById(id: string): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: 'API not configured' } as ApiResponse<any>;
        return this.client.get(API_CONFIG.ENDPOINTS.CONTACT_BY_ID(id));
    }

    // Update contact (admin)
    async updateContact(id: string, data: any): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: 'API not configured' } as ApiResponse<any>;
        return this.client.patch(API_CONFIG.ENDPOINTS.CONTACT_UPDATE(id), data);
    }

    // Delete contact (admin)
    async deleteContact(id: string): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: 'API not configured' } as ApiResponse<any>;
        return this.client.delete(API_CONFIG.ENDPOINTS.CONTACT_DELETE(id));
    }

    // Mark contact as read (admin)
    async markAsRead(id: string): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: 'API not configured' } as ApiResponse<any>;
        return this.client.post(API_CONFIG.ENDPOINTS.CONTACT_MARK_READ(id));
    }

    // Archive contact (admin)
    async archiveContact(id: string): Promise<ApiResponse<any>> {
        if (!isApiConfigured()) return { success: false, error: 'API not configured' } as ApiResponse<any>;
        return this.client.post(API_CONFIG.ENDPOINTS.CONTACT_ARCHIVE(id));
    }
}

export const contactService = new ContactService();
export default contactService;
