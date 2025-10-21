export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  isActive: boolean;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Screen {
  id: string;
  name: string;
  capacity?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  customerEmail?: string;
  customerName?: string;
  customer?: Customer;
  screen?: Screen;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  addons?: Addon[];
}

export type PaymentMethod = 'cash' | 'card';
// export type PaymentMethod = 'cash' | 'card' | 'upi' | 'netbanking';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  isTestMode: boolean;
  currency: string;
}

export interface RazorpayPayment {
  id: string;
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  method: string;
  createdAt: string;
}

export interface TaxConfiguration {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  provider: 'razorpay' | 'stripe' | 'payu';
  isActive: boolean;
  isDefault: boolean;
  config: RazorpayConfig;
  createdAt: string;
  updatedAt: string;
}

export interface PrinterConfiguration {
  id: string;
  name: string;
  type: 'thermal' | 'receipt';
  connectionType: 'usb' | 'network' | 'bluetooth';
  settings: PrinterSettings;
  isActive: boolean;
  isDefault: boolean;
}

export interface PrinterSettings {
  paperWidth: number;
  charactersPerLine: number;
  ipAddress?: string;
  port?: number;
  deviceName?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  paymentMethod?: PaymentMethod;
  user?: string;
  status?: OrderStatus;
}

export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topItems: {
    item: MenuItem;
    quantity: number;
    revenue: number;
  }[];
  salesByCategory: {
    category: Category;
    sales: number;
    orderCount: number;
  }[];
  salesByPaymentMethod: {
    method: PaymentMethod;
    sales: number;
    orderCount: number;
  }[];
  salesByHour: {
    hour: number;
    sales: number;
    orderCount: number;
  }[];
}

export interface EmailConfig {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  logoUrl: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// src/types/Receipt.ts
export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface Receipt {
  storeName: string;
  address?: string;
  items: ReceiptItem[];
  total: number;
  qrCode?: string;
  logo?: string;
}
