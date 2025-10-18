import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { MenuItem, OrderItem, Order, PaymentMethod, TaxConfiguration, Addon } from '../types';
import { EmailService } from '../services/emailService';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface POSContextType {
  cart: CartItem[];
  selectedAddons: Addon[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleAddon: (addon: Addon) => void;
  calculateTotals: () => {
    subtotal: number;
    taxAmount: number;
    addonsTotal: number;
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

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [globalTaxRate, setGlobalTaxRate] = useState<number>(0.18);

  useEffect(() => {
    loadTaxRate();
  }, []);

  const loadTaxRate = async () => {
    try {
      debugger
      const settings = await apiClient.getSettings();
      const taxRateSetting = settings.find((s: any) => s.key === 'tax_rate');
      if (taxRateSetting) {
        setGlobalTaxRate(parseFloat(taxRateSetting.value));
      }
    } catch (error) {
      console.error('Failed to load tax rate:', error);
    }
  };

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
    setSelectedAddons([]);
  };

  const toggleAddon = (addon: Addon) => {
    debugger;
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const calculateTotals = () => {
    debugger
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.menuItem.price * item.quantity),
      0
    );

    const addonsTotal = selectedAddons.reduce(
      (sum, addon) => sum + Number(addon.price),
      0
    );

    const taxAmount = subtotal * globalTaxRate;
    const total = subtotal + taxAmount + addonsTotal;

    return { subtotal, taxAmount, addonsTotal, total };
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
        addonIds: selectedAddons.map(addon => addon.id),
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

      try {
        const receipt = {
          storeName: 'The Loft Coimbatore',
          address: 'Coimbatore, Tamil Nadu',
          orderNumber: order.orderNumber || order.order_number,
          customerName: customerData.name || 'Guest',
          items: (order.items || order.orderItems || []).map((item: any) => ({
            name: item.menuItem?.name || item.name || 'Item',
            qty: item.quantity,
            price: item.price || item.menuItem?.price || 0,
          })),
          subtotal: order.subtotal || 0,
          tax: order.taxAmount || order.tax_amount || 0,
          total: order.total || 0,
          paymentMethod: order.payment?.paymentMethod || customerData.paymentMethod,
          qrCode: order.orderNumber || order.order_number,
        };

        await apiClient.printReceipt(receipt);
        console.log('Receipt sent to printer');
      } catch (printError) {
        console.error('Failed to print receipt:', printError);
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
      selectedAddons,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleAddon,
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