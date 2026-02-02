// Service Order API Client

export interface ProductLink {
  url: string;
  quantity: string | number;
}

export interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  province: string;
  district?: string;
  ward?: string;
}

export interface CreateServiceOrderRequest {
  serviceType: string;
  server: string;
  region?: string;
  quality?: string;
  productLinks: ProductLink[];
  shippingInfo?: ShippingInfo;
  note?: string;
}

export interface ServiceOrder {
  _id: string;
  userId: string;
  serviceType: string;
  platform: string;
  server: string;
  serverId: string;
  serverName: string;
  priceMultiplier: number;
  estimatedTime: string;
  region?: string;
  quality?: string;
  qualityMultiplier: number;
  productLinks: ProductLink[];
  shippingInfo?: ShippingInfo;
  note?: string;
  totalPrice: number;
  basePrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'wallet';
  processStartedAt?: string;
  processCompletedAt?: string;
  failureReason?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrdersResponse {
  success: boolean;
  data: ServiceOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateServiceOrderResponse {
  success: boolean;
  data: {
    order: ServiceOrder;
    transaction: any;
  };
  message: string;
}

export class ServiceOrderAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/service-orders') {
    this.baseUrl = baseUrl;
  }

  async getServiceOrders(params?: {
    status?: string;
    platform?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceOrdersResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.platform) searchParams.append('platform', params.platform);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch service orders');
    }

    return response.json();
  }

  async createServiceOrder(data: CreateServiceOrderRequest): Promise<CreateServiceOrderResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create service order');
    }

    return response.json();
  }

  async getServiceOrderById(orderId: string): Promise<{ success: boolean; data: ServiceOrder }> {
    const response = await fetch(`${this.baseUrl}/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch service order');
    }

    return response.json();
  }

  async cancelServiceOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel service order');
    }

    return response.json();
  }
}

export const serviceOrderAPI = new ServiceOrderAPI();
