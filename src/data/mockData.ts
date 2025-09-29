import { MenuItem, Category, User, Order, AuditLog } from '../types';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Beverages',
    description: 'Hot and cold drinks',
    isActive: true,
    sortOrder: 1
  },
  {
    id: '2',
    name: 'Snacks',
    description: 'Theatre snacks and treats',
    isActive: true,
    sortOrder: 2
  },
  {
    id: '3',
    name: 'Main Course',
    description: 'Full meals and main dishes',
    isActive: true,
    sortOrder: 3
  },
  {
    id: '4',
    name: 'Desserts',
    description: 'Sweet treats and desserts',
    isActive: true,
    sortOrder: 4
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea',
    price: 25,
    category: mockCategories[0],
    isActive: true,
    taxRate: 0.05,
    image: 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '2',
    name: 'Filter Coffee',
    description: 'South Indian filter coffee',
    price: 30,
    category: mockCategories[0],
    isActive: true,
    taxRate: 0.05,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '3',
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime soda',
    price: 35,
    category: mockCategories[0],
    isActive: true,
    taxRate: 0.12,
    image: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '4',
    name: 'Samosa',
    description: 'Crispy fried pastry with spiced filling',
    price: 20,
    category: mockCategories[1],
    isActive: true,
    taxRate: 0.05,
    image: 'https://images.pexels.com/photos/11214459/pexels-photo-11214459.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '5',
    name: 'Popcorn',
    description: 'Classic theatre popcorn',
    price: 80,
    category: mockCategories[1],
    isActive: true,
    taxRate: 0.18,
    image: 'https://images.pexels.com/photos/1404815/pexels-photo-1404815.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '6',
    name: 'Nachos with Cheese',
    description: 'Crispy nachos with melted cheese',
    price: 120,
    category: mockCategories[1],
    isActive: true,
    taxRate: 0.18,
    image: 'https://images.pexels.com/photos/1166120/pexels-photo-1166120.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '7',
    name: 'Veg Biryani',
    description: 'Aromatic vegetable biryani',
    price: 180,
    category: mockCategories[2],
    isActive: true,
    taxRate: 0.05,
    image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '8',
    name: 'Chicken Biryani',
    description: 'Traditional chicken biryani',
    price: 220,
    category: mockCategories[2],
    isActive: true,
    taxRate: 0.05,
    image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '9',
    name: 'Ice Cream',
    description: 'Vanilla ice cream scoop',
    price: 60,
    category: mockCategories[3],
    isActive: true,
    taxRate: 0.18,
    image: 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '10',
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with nuts',
    price: 90,
    category: mockCategories[3],
    isActive: true,
    taxRate: 0.18,
    image: 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

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
    userAgent: 'Mozilla/5.0'
  }
];