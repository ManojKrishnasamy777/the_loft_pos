import React, { createContext, useContext, useState } from 'react';
import { MenuItem, OrderItem, Order, PaymentMethod, TaxConfiguration } from '../types';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface POSContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => {
    subtotal: number;
    taxAmount: number;
    total: number;
  };
  processOrder: (customerData: {
    name?: string;
    email?: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Order>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

// Mock tax configuration
const mockTaxConfig: TaxConfiguration = {
  id: '1',
  name: 'GST',
  rate: 0.18, // 18%
  isActive: true,
  isDefault: true
};

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menuItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.menuItem.price * item.quantity),
      0
    );
    
    const taxAmount = subtotal * mockTaxConfig.rate;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const processOrder = async (customerData: {
    name?: string;
    email?: string;
    paymentMethod: PaymentMethod;
  }): Promise<Order> => {
    const totals = calculateTotals();
    const orderNumber = `ORD-${Date.now()}`;
    
    const orderItems: OrderItem[] = cart.map(cartItem => ({
      id: `item-${cartItem.menuItem.id}-${Date.now()}`,
      menuItem: cartItem.menuItem,
      quantity: cartItem.quantity,
      price: cartItem.menuItem.price,
      taxAmount: cartItem.menuItem.price * cartItem.quantity * mockTaxConfig.rate,
      subtotal: cartItem.menuItem.price * cartItem.quantity,
      total: cartItem.menuItem.price * cartItem.quantity * (1 + mockTaxConfig.rate)
    }));

    // Mock order creation - in production this would be an API call
    const order: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      items: orderItems,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      customerEmail: customerData.email,
      customerName: customerData.name,
      paymentMethod: customerData.paymentMethod,
      status: 'completed',
      createdBy: {
        id: '1',
        name: 'Current User',
        email: 'user@example.com',
        role: { id: '1', name: 'Cashier', permissions: [] },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Clear cart after successful order
    clearCart();

    return order;
  };

  return (
    <POSContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      calculateTotals,
      processOrder
    }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}