import { MenuItem, Category, User, Order, AuditLog } from '../types';
import { apiClient } from '../config/api';

// Data will be fetched from API
export let mockCategories: Category[] = [];
export let mockMenuItems: MenuItem[] = [];

// Load data from API
export const loadMenuData = async () => {
  try {
    const [categories, menuItems] = await Promise.all([
      apiClient.getCategories(),
      apiClient.getMenuItems(),
    ]);

    // Update the arrays in place so any existing references stay valid
    mockCategories.length = 0;
    mockCategories.push(...categories);

    mockMenuItems.length = 0;
    mockMenuItems.push(...menuItems);
  } catch (error) {
    console.error('Failed to load menu data:', error);
  }
};

// Orders and audit logs mock data
export const mockOrders: Order[] = [
  // This would be populated with actual orders from the backend
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Admin User',
    action: 'CREATE',
    resource: 'order',
    resourceId: 'ORD-001',
    oldValues: null,
    newValues: { total: 150, status: 'completed' },
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
  },
];
