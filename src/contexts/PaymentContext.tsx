import React, { createContext, useContext, useState } from 'react';
import { RazorpayConfig, RazorpayPayment, PaymentGatewayConfig } from '../types';

interface PaymentContextType {
  paymentConfig: PaymentGatewayConfig | null;
  initializeRazorpay: (config: RazorpayConfig) => Promise<boolean>;
  processRazorpayPayment: (amount: number, orderData: any) => Promise<RazorpayPayment>;
  verifyPayment: (paymentData: any) => Promise<boolean>;
  refundPayment: (paymentId: string, amount?: number) => Promise<boolean>;
  isPaymentGatewayReady: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Mock Razorpay configuration - in production, this would come from your backend
const mockRazorpayConfig: PaymentGatewayConfig = {
  id: '1',
  name: 'Razorpay Gateway',
  provider: 'razorpay',
  isActive: true,
  isDefault: true,
  config: {
    keyId: 'rzp_test_1234567890', // Replace with your actual test key
    keySecret: 'your_key_secret', // This should be stored securely on backend
    webhookSecret: 'your_webhook_secret',
    isTestMode: true,
    currency: 'INR'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig | null>(mockRazorpayConfig);
  const [isPaymentGatewayReady, setIsPaymentGatewayReady] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initializeRazorpay = async (config: RazorpayConfig): Promise<boolean> => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      setPaymentConfig({
        ...mockRazorpayConfig,
        config
      });
      setIsPaymentGatewayReady(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize Razorpay:', error);
      setIsPaymentGatewayReady(false);
      return false;
    }
  };

  const processRazorpayPayment = async (amount: number, orderData: any): Promise<RazorpayPayment> => {
    if (!paymentConfig || !isPaymentGatewayReady) {
      throw new Error('Payment gateway not initialized');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: paymentConfig.config.keyId,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: paymentConfig.config.currency,
        name: 'The Loft Coimbatore',
        description: `Order #${orderData.orderNumber}`,
        image: '/logo.png', // Add your logo
        order_id: `order_${Date.now()}`, // This should come from your backend
        handler: function (response: any) {
          const payment: RazorpayPayment = {
            id: `payment_${Date.now()}`,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            amount: amount,
            currency: paymentConfig.config.currency,
            status: 'captured',
            method: 'razorpay',
            createdAt: new Date().toISOString()
          };
          resolve(payment);
        },
        prefill: {
          name: orderData.customerName || '',
          email: orderData.customerEmail || '',
          contact: orderData.customerPhone || ''
        },
        notes: {
          order_id: orderData.orderNumber,
          theatre: 'The Loft Coimbatore'
        },
        theme: {
          color: '#D97706' // Amber color matching your theme
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  const verifyPayment = async (paymentData: any): Promise<boolean> => {
    try {
      // In production, this verification should be done on your backend
      // using Razorpay's webhook or payment verification API
      
      // Mock verification - always returns true for demo
      // In real implementation, you would:
      // 1. Send payment data to your backend
      // 2. Backend verifies the signature using Razorpay's crypto
      // 3. Return verification result
      
      console.log('Verifying payment:', paymentData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  };

  const refundPayment = async (paymentId: string, amount?: number): Promise<boolean> => {
    try {
      // In production, this would call your backend API
      // which would then call Razorpay's refund API
      
      console.log('Processing refund for payment:', paymentId, 'Amount:', amount);
      
      // Mock refund process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error('Refund failed:', error);
      return false;
    }
  };

  return (
    <PaymentContext.Provider value={{
      paymentConfig,
      initializeRazorpay,
      processRazorpayPayment,
      verifyPayment,
      refundPayment,
      isPaymentGatewayReady
    }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}