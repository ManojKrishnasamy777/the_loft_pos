import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, CreditCard, Smartphone, DollarSign, Globe, Loader2 } from 'lucide-react';
import { PaymentMethod } from '../../types';
import { usePOS } from '../../contexts/POSContext';
import { usePayment } from '../../contexts/PaymentContext';

interface PaymentModalProps {
  total: number;
  customerId?: string | null;
  screenId?: string | null;
  onClose: () => void;
  onSuccess?: (order: any) => void;
}

export function PaymentModal({ total, customerId, screenId, onClose, onSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const { processOrder } = usePOS();
  const { processRazorpayPayment, verifyPayment, isPaymentGatewayReady } = usePayment();
  const [notes, setNotes] = useState('');


  const paymentMethods = [
    { id: 'cash' as PaymentMethod, label: 'Cash', icon: DollarSign },
    { id: 'card' as PaymentMethod, label: 'Card', icon: CreditCard },
    // { id: 'upi' as PaymentMethod, label: 'UPI', icon: Smartphone },
    // { id: 'netbanking' as PaymentMethod, label: 'Net Banking', icon: Globe },
  ];

  const handlePayment = async () => {
    setPaymentError('');

    if (paymentMethod === 'cash' && cashReceived < total) {
      setPaymentError('Insufficient cash received');
      return;
    }

    setIsProcessing(true);

    try {
      let paymentResult = null;

      // Handle different payment methods
      // if (paymentMethod === 'card' || paymentMethod === 'upi' || paymentMethod === 'netbanking') {
      //   if (!isPaymentGatewayReady) {
      //     throw new Error('Payment gateway not ready. Please try again.');
      //   }

      //   // Process online payment through Razorpay
      //   const orderData = {
      //     orderNumber: `ORD-${Date.now()}`,
      //     total
      //   };

      //   paymentResult = await processRazorpayPayment(total, orderData);

      //   // Verify payment
      //   const isVerified = await verifyPayment(paymentResult);
      //   if (!isVerified) {
      //     throw new Error('Payment verification failed');
      //   }
      // }
      debugger;
      const order = await processOrder({
        customerId: customerId || undefined,
        screenId: screenId || undefined,
        paymentMethod,
        paymentData: paymentResult,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      const successMessage = paymentMethod === 'cash' || paymentMethod === 'card'
        ? `Order ${order.orderNumber} completed successfully!`
        : `Payment successful! Order ${order.orderNumber} completed.`;

      toast.success(successMessage);

      if (onSuccess) {
        onSuccess(order);
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment. Please try again.';
      setPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const change = paymentMethod === 'cash' || paymentMethod === 'card' ? Math.max(0, cashReceived - total) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Process Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Order Total */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
              <span>Total Amount:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-medium text-gray-900">Payment Method</h3>
              {/* {!isPaymentGatewayReady && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  Online payments loading...
                </span>
              )} */}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                // const isOnlinePayment = method.id !== 'cash';
                const isOnlinePayment = false;
                const isDisabled = isOnlinePayment && !isPaymentGatewayReady;

                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    // disabled={isDisabled}
                    className={`p-3 sm:p-4 border-2 rounded-lg flex flex-col items-center space-y-1 sm:space-y-2 transition-colors touch-manipulation ${paymentMethod === method.id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : isDisabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm font-medium">{method.label}</span>
                    {/* {isOnlinePayment && (
                      <span className="text-xs text-gray-500">via Razorpay</span>
                    )} */}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this order..."
              className="w-full h-18 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 resize-y"
            />
          </div>

          {/* Cash Payment Details */}
          {/* {paymentMethod === 'cash' || paymentMethod === 'card' && ( */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Cash Received
              </label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {cashReceived > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Cash Received:</span>
                  <span>₹{cashReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Order Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-green-200">
                  <span>Change:</span>
                  <span className={change < 0 ? 'text-red-600' : 'text-green-600'}>
                    ₹{Math.abs(change).toFixed(2)} {change < 0 ? '(Short)' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* )} */}

          {/* Payment Error */}
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{paymentError}</p>
            </div>
          )}

          {/* Payment Gateway Info */}
          {/* {(paymentMethod === 'card' || paymentMethod === 'upi' || paymentMethod === 'netbanking') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <p className="text-blue-800 text-sm font-medium">Secure Payment by Razorpay</p>
              </div>
              <p className="text-blue-600 text-xs mt-1">
                Your payment information is encrypted and secure
              </p>
            </div>
          )} */}

          {/* Action Buttons */}
          <div className="flex space-x-2 sm:space-x-3 pt-3 sm:pt-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 bg-gray-300 text-gray-700 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-400 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || ((paymentMethod === 'cash' || paymentMethod === 'card') && cashReceived < total)}
              className="flex-1 bg-amber-600 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 touch-manipulation"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {isProcessing
                  ? ((paymentMethod === 'cash' || paymentMethod === 'card') ? 'Processing...' : 'Processing Payment...')
                  : 'Complete Order'
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}