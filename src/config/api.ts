const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return response.text() as unknown as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.access_token);
    return response;
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  // Menu endpoints
  async getCategories() {
    return this.request<any[]>('/menu/categories/active');
  }

  async getMenuItems() {
    return this.request<any[]>('/menu/items/active');
  }

  async createMenuItem(data: any) {
    return this.request<any>('/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: any) {
    return this.request<any>(`/menu/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Order endpoints
  async createOrder(data: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ orders: any[]; total: number }>(`/orders${queryString}`);
  }

  async getOrderById(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async getTodaysOrders() {
    return this.request<any[]>('/orders/today');
  }

  async getOrderStats(dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    return this.request<any>(`/orders/stats?${params.toString()}`);
  }

  // Payment endpoints
  async createRazorpayOrder(orderId: string) {
    return this.request<any>(`/payments/razorpay/create-order/${orderId}`, {
      method: 'POST',
    });
  }

  async verifyPayment(data: any) {
    return this.request<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayments() {
    return this.request<any[]>('/payments');
  }

  // Reports endpoints
  async getSalesReport(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/reports/sales${queryString}`);
  }

  async getItemPerformanceReport(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/reports/items${queryString}`);
  }

  async getDailySalesReport(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/reports/daily${queryString}`);
  }

  async getCustomerAnalytics(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/reports/customers${queryString}`);
  }

  async exportReport(type: string, params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetch(`${this.baseURL}/reports/export/${type}${queryString}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Settings endpoints
  async getSettings() {
    return this.request<any[]>('/settings');
  }

  async getSetting(key: string) {
    return this.request<any>(`/settings/${key}`);
  }

  async updateSetting(key: string, data: any) {
    return this.request<any>(`/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Users endpoints
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async createUser(data: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Customers endpoints
  async getCustomers() {
    return this.request<any[]>('/customers');
  }

  async getActiveCustomers() {
    return this.request<any[]>('/customers/active');
  }

  async getCustomerById(id: string) {
    return this.request<any>(`/customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: any) {
    return this.request<any>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string) {
    return this.request<any>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Screens endpoints
  async getScreens() {
    return this.request<any[]>('/screens');
  }

  async getScreenById(id: string) {
    return this.request<any>(`/screens/${id}`);
  }

  async createScreen(data: any) {
    return this.request<any>('/screens', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScreen(id: string, data: any) {
    return this.request<any>(`/screens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteScreen(id: string) {
    return this.request<any>(`/screens/${id}`, {
      method: 'DELETE',
    });
  }


  // Audit endpoints
  async getAuditLogs(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ logs: any[]; total: number }>(`/audit${queryString}`);
  }

  async getAuditStats(dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    return this.request<any>(`/audit/stats?${params.toString()}`);
  }

  // Email endpoints
  async getEmailConfigs() {
    return this.request<any[]>('/email/config');
  }

  async getActiveEmailConfig() {
    return this.request<any>('/email/config/active');
  }

  async getEmailConfigById(id: string) {
    return this.request<any>(`/email/config/${id}`);
  }

  async createEmailConfig(data: any) {
    return this.request<any>('/email/config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailConfig(id: string, data: any) {
    return this.request<any>(`/email/config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailConfig(id: string) {
    return this.request<any>(`/email/config/${id}`, {
      method: 'DELETE',
    });
  }

  async testEmailConnection(id: string) {
    return this.request<any>(`/email/test/${id}`, {
      method: 'POST',
    });
  }

  async sendOrderConfirmationEmail(orderData: any, customerEmail: string) {
    return this.request<any>('/email/send-order-confirmation', {
      method: 'POST',
      body: JSON.stringify({ orderData, customerEmail }),
    });
  }

  async getRoles() {
    return this.request<any[]>('/users/roles');
  }

  async getRoleById(id: string) {
    return this.request<any>(`/users/roles/${id}`);
  }

  async createRole(data: any) {
    return this.request<any>('/users/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: any) {
    return this.request<any>(`/users/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string) {
    return this.request<any>(`/users/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async getPermissions() {
    return this.request<any[]>('/users/permissions');
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    return this.request<any>(`/users/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    });
  }

  async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(id: string) {
    return this.request<any>(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/menu/upload`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    return response.json();
  }

  async deleteImage(imageUrl: string) {
    return this.request<any>('/menu/delete-image', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;