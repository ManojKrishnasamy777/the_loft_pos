import React, { createContext, useContext, useState } from 'react';
import { apiClient } from '../config/api';
import { MenuItem, OrderItem, Order, PaymentMethod, TaxConfiguration } from '../types';
import { EmailService } from '../services/emailService';

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
    customerId?: string;
    screenId?: string;
    paymentMethod: PaymentMethod;
    paymentData?: any;
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
    customerId?: string;
    screenId?: string;
    paymentMethod: PaymentMethod;
    paymentData?: any;
  }): Promise<Order> => {
    try {
      const orderData = {
        items: cart.map(cartItem => ({
          menuItemId: cartItem.menuItem.id,
          quantity: cartItem.quantity,
        })),
        customerEmail: customerData.email,
        customerName: customerData.name,
        customerId: customerData.customerId,
        screenId: customerData.screenId,
        paymentMethod: customerData.paymentMethod,
        metadata: customerData.paymentData,
      };

      const order = await apiClient.createOrder(orderData);

      if (customerData.email && order.status === 'completed') {
        try {
          await EmailService.sendOrderConfirmation(order);
          console.log('Order confirmation email sent to:', customerData.email);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      clearCart();

      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
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