import { apiClient, isApiConfigured } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import { ApiResponse } from '@/types/api';

export enum PromoType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

export interface Promo {
    id: string;
    code: string;
    type: PromoType;
    value: number; // percentage (0-100) or fixed amount
    isActive: boolean;
    maxUses?: number | null;
    usedCount?: number;
    validFrom?: string | null;
    validTo?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePromoRequest {
    code: string;
    type: PromoType;
    value: number;
    isActive?: boolean;
    maxUses?: number | null;
    validFrom?: string | null;
    validTo?: string | null;
}

export interface UpdatePromoRequest {
    code?: string;
    type?: PromoType;
    value?: number;
    isActive?: boolean;
    maxUses?: number | null;
    validFrom?: string | null;
    validTo?: string | null;
}

export interface ValidatePromoRequest {
    code: string;
    courseId?: string;
    userId?: string;
    price?: number; // optional price to let backend compute applied amount
}

export interface ValidatePromoResponse {
    valid: boolean;
    code?: string;
    type?: PromoType;
    value?: number;
    message?: string;
    appliedAmount?: number; // how much will be deducted from provided price
    remainingUses?: number | null;
}

export class PromoService {
    private client = apiClient;

    constructor(client = apiClient) {
        this.client = client;
    }

    async validatePromo(data: ValidatePromoRequest): Promise<ApiResponse<ValidatePromoResponse>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.post<ValidatePromoResponse>(API_CONFIG.ENDPOINTS.PROMO_VALIDATE, data);
    }

    async createPromo(data: CreatePromoRequest): Promise<ApiResponse<Promo>> {
        if (!isApiConfigured()) throw new Error('API is not configured');
        return this.client.post<Promo>(API_CONFIG.ENDPOINTS.PROMO_CREATE, data);
    }

    async listPromos(params?: Record<string, any>): Promise<ApiResponse<{ promos: Promo[]; total?: number }>> {
        if (!isApiConfigured()) return { success: true, data: { promos: [], total: 0 } } as ApiResponse<any>;
        return this.client.get<{ promos: Promo[]; total?: number }>(API_CONFIG.ENDPOINTS.PROMOS, params);
    }

    async getPromoById(id: string): Promise<ApiResponse<Promo>> {
        if (!isApiConfigured()) throw new Error('API is not configured');
        return this.client.get<Promo>(API_CONFIG.ENDPOINTS.PROMO_BY_ID(id));
    }

    async updatePromo(id: string, data: UpdatePromoRequest): Promise<ApiResponse<Promo>> {
        if (!isApiConfigured()) throw new Error('API is not configured');
        return this.client.patch<Promo>(API_CONFIG.ENDPOINTS.PROMO_UPDATE(id), data);
    }

    async deletePromo(id: string): Promise<ApiResponse<void>> {
        if (!isApiConfigured()) throw new Error('API is not configured');
        return this.client.delete<void>(API_CONFIG.ENDPOINTS.PROMO_DELETE(id));
    }
}

export const promoService = new PromoService();
