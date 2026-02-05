import { apiClient, isApiConfigured } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import { ApiResponse } from '@/types/api';

// Payment Types
export interface PaymentIntent {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
}

export interface PaymentConfirmation {
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
    receiptUrl?: string;
}

export interface PaymentHistory {
    id: string;
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SSLCommerzInitResponse {
    success?: boolean; // For backend enrollment check
    message?: string; // For error messages like "already enrolled"
    sessionKey?: string;
    gatewayPageURL?: string;
    GatewayPageURL?: string;
    redirectGatewayURL?: string;
    status?: string;
}

export interface SSLCommerzCallbackData {
    status: string;
    tranId: string;
    amount: string;
    currency: string;
    bankTranId?: string;
    cardType?: string;
    cardNo?: string;
    validatedOn?: string;
    storeAmount?: string;
    riskLevel?: string;
    riskTitle?: string;
}

// Request Types
export interface CreatePaymentIntentRequest {
    courseId: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
}

export interface ConfirmPaymentRequest {
    paymentIntentId: string;
    paymentMethodId?: string;
}

export interface InitSSLCommerzRequest {
    courseId: string;
    amount: number;
    currency?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCity?: string;
    customerPostcode?: string;
    productName?: string;
    productCategory?: string;
}

export class PaymentService {
    private client: typeof apiClient;

    constructor(client = apiClient) {
        this.client = client;
    }

    // ==================== Stripe Payment Methods ====================

    /**
     * Create a payment intent for Stripe
     */
    async createPaymentIntent(
        data: CreatePaymentIntentRequest
    ): Promise<ApiResponse<PaymentIntent>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.post<PaymentIntent>(
            API_CONFIG.ENDPOINTS.PAYMENT_CREATE_INTENT,
            data
        );
    }

    /**
     * Confirm a payment
     */
    async confirmPayment(
        data: ConfirmPaymentRequest
    ): Promise<ApiResponse<PaymentConfirmation>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.post<PaymentConfirmation>(
            API_CONFIG.ENDPOINTS.PAYMENT_CONFIRM,
            data
        );
    }

    /**
     * Get payment history
     */
    async getPaymentHistory(params?: {
        page?: number;
        limit?: number;
        status?: string;
        courseId?: string;
    }): Promise<ApiResponse<{ payments: PaymentHistory[]; total: number; page: number; limit: number }>> {
        if (!isApiConfigured()) {
            const page = params?.page ?? 1;
            const limit = params?.limit ?? API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
            return {
                success: true,
                data: { payments: [], total: 0, page, limit }
            } as ApiResponse<{ payments: PaymentHistory[]; total: number; page: number; limit: number }>;
        }
        return this.client.get<{ payments: PaymentHistory[]; total: number; page: number; limit: number }>(
            API_CONFIG.ENDPOINTS.PAYMENT_HISTORY,
            params
        );
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId: string): Promise<ApiResponse<PaymentHistory>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.get<PaymentHistory>(
            API_CONFIG.ENDPOINTS.PAYMENT_BY_ID(paymentId)
        );
    }

    /**
     * Get payment by transaction ID
     */
    async getPaymentByTransactionId(transactionId: string): Promise<ApiResponse<PaymentHistory>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.get<PaymentHistory>(
            API_CONFIG.ENDPOINTS.PAYMENT_BY_TRANSACTION_ID(transactionId)
        );
    }

    // ==================== SSLCommerz Payment Methods ====================

    /**
     * Initialize SSLCommerz payment
     */
    async initSSLCommerzPayment(
        data: InitSSLCommerzRequest
    ): Promise<ApiResponse<SSLCommerzInitResponse>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.post<SSLCommerzInitResponse>(
            API_CONFIG.ENDPOINTS.PAYMENT_SSLCOMMERZ_INIT,
            data
        );
    }

    /**
     * Handle SSLCommerz success callback
     */
    async handleSSLCommerzSuccess(
        data: SSLCommerzCallbackData
    ): Promise<ApiResponse<{ message: string; enrollmentId?: string }>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.post<{ message: string; enrollmentId?: string }>(
            API_CONFIG.ENDPOINTS.PAYMENT_SSLCOMMERZ_SUCCESS,
            data
        );
    }

    /**
     * Handle SSLCommerz fail callback
     */
    async handleSSLCommerzFail(
        data: SSLCommerzCallbackData
    ): Promise<ApiResponse<{ message: string }>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.post<{ message: string }>(
            API_CONFIG.ENDPOINTS.PAYMENT_SSLCOMMERZ_FAIL,
            data
        );
    }

    /**
     * Handle SSLCommerz cancel callback
     */
    async handleSSLCommerzCancel(
        data: SSLCommerzCallbackData
    ): Promise<ApiResponse<{ message: string }>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.post<{ message: string }>(
            API_CONFIG.ENDPOINTS.PAYMENT_SSLCOMMERZ_CANCEL,
            data
        );
    }

    /**
     * Handle SSLCommerz IPN (Instant Payment Notification)
     */
    async handleSSLCommerzIPN(
        data: SSLCommerzCallbackData
    ): Promise<ApiResponse<{ message: string }>> {
        if (!isApiConfigured()) {
            throw new Error('API is not configured');
        }
        return this.client.post<{ message: string }>(
            API_CONFIG.ENDPOINTS.PAYMENT_SSLCOMMERZ_IPN,
            data
        );
    }

    // ==================== Utility Methods ====================

    /**
     * Format amount for display
     */
    formatAmount(amount: number, currency: string = 'BDT'): string {
        const formatter = new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
        return formatter.format(amount);
    }

    /**
     * Get payment status badge color
     */
    getPaymentStatusColor(status: string): string {
        const statusColors: Record<string, string> = {
            succeeded: 'green',
            success: 'green',
            completed: 'green',
            pending: 'yellow',
            processing: 'blue',
            failed: 'red',
            cancelled: 'gray',
            refunded: 'purple',
        };
        return statusColors[status.toLowerCase()] || 'gray';
    }

    /**
     * Validate payment amount
     */
    validateAmount(amount: number, minAmount: number = 1): boolean {
        return amount >= minAmount && amount <= 999999999;
    }

    /**
     * Generate payment metadata
     */
    generatePaymentMetadata(data: {
        userId: string;
        courseId: string;
        courseName: string;
        userName?: string;
        userEmail?: string;
    }): Record<string, any> {
        return {
            userId: data.userId,
            courseId: data.courseId,
            courseName: data.courseName,
            userName: data.userName || '',
            userEmail: data.userEmail || '',
            timestamp: new Date().toISOString(),
        };
    }
}

// Export singleton instance
export const paymentService = new PaymentService();
