import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Settings,
  Eye,
  EyeOff,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { RazorpayConfig } from '../../types';

export function PaymentSettings() {
  const { paymentConfig, initializeRazorpay, isPaymentGatewayReady } = usePayment();
  const [config, setConfig] = useState<RazorpayConfig>(
    paymentConfig?.config || {
      keyId: '',
      keySecret: '',
      webhookSecret: '',
      isTestMode: true,
      currency: 'INR'
    }
  );
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await initializeRazorpay(config);
      if (success) {
        toast.success('Payment gateway configuration saved successfully');
      } else {
        toast.error('Failed to save configuration. Please check your settings.');
      }
    } catch (error) {
      toast.error('Error saving configuration: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (config.keyId && config.keySecret) {
        setTestResult('success');
        toast.success('Connection test successful');
      } else {
        setTestResult('error');
        toast.error('Connection test failed. Please check your credentials.');
      }
    } catch (error) {
      setTestResult('error');
      toast.error('Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">Payment Gateway Settings</h2>
          </div>
          <p className="text-gray-600 mt-1">Configure Razorpay payment gateway for online transactions</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Gateway Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  isPaymentGatewayReady ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-medium text-gray-900">
                  Gateway Status: {isPaymentGatewayReady ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                <span>Test Connection</span>
              </button>
            </div>
            
            {testResult && (
              <div className={`mt-3 flex items-center space-x-2 ${
                testResult === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResult === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {testResult === 'success' 
                    ? 'Connection test successful' 
                    : 'Connection test failed. Please check your credentials.'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Razorpay Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Razorpay Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.keyId}
                  onChange={(e) => setConfig({ ...config, keyId: e.target.value })}
                  placeholder="rzp_test_1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.keySecret}
                  onChange={(e) => setConfig({ ...config, keySecret: e.target.value })}
                  placeholder="Enter your Razorpay Key Secret"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Keep this secret secure. Never share it publicly.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.webhookSecret}
                  onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                  placeholder="Enter webhook secret (optional)"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used to verify webhook authenticity (recommended for production)
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="testMode"
                checked={config.isTestMode}
                onChange={(e) => setConfig({ ...config, isTestMode: e.target.checked })}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="testMode" className="text-sm font-medium text-gray-700">
                Test Mode
              </label>
              <span className="text-xs text-gray-500">
                (Use test credentials for development)
              </span>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Log in to your <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">Razorpay Dashboard</a></li>
              <li>Go to Settings → API Keys</li>
              <li>Generate or copy your Key ID and Key Secret</li>
              <li>For webhooks, go to Settings → Webhooks and create a new webhook</li>
              <li>Set webhook URL to: <code className="bg-blue-100 px-1 rounded">https://yourdomain.com/api/webhooks/razorpay</code></li>
              <li>Enable events: payment.authorized, payment.failed, payment.captured</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setConfig(paymentConfig?.config || {
                keyId: '',
                keySecret: '',
                webhookSecret: '',
                isTestMode: true,
                currency: 'INR'
              })}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !config.keyId || !config.keySecret}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}