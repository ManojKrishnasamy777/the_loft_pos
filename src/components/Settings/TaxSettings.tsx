import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../../config/api';
import { Save, Plus, CreditCard as Edit, Trash2 } from 'lucide-react';

export function TaxSettings() {
  const [taxRates, setTaxRates] = useState([
    { id: '1', name: 'GST (5%)', rate: 0.05, isDefault: false },
    { id: '2', name: 'GST (12%)', rate: 0.12, isDefault: false },
    { id: '3', name: 'GST (18%)', rate: 0.18, isDefault: true },
    { id: '4', name: 'GST (28%)', rate: 0.28, isDefault: false }
  ]);
  const [defaultTaxRate, setDefaultTaxRate] = useState('0.18');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await apiClient.getSettings();
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setDefaultTaxRate(settingsMap.tax_rate || '0.18');
      setTaxEnabled(settingsMap.tax_enabled === 'true');
    } catch (error) {
      console.error('Failed to load tax settings:', error);
      toast.error('Failed to load tax settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await Promise.all([
        apiClient.updateSetting('tax_rate', { value: defaultTaxRate }),
        apiClient.updateSetting('tax_enabled', { value: taxEnabled.toString() })
      ]);
      toast.success('Tax settings saved successfully');
    } catch (error) {
      console.error('Failed to save tax settings:', error);
      toast.error('Failed to save tax settings. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Tax Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure tax rates for your menu items</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <input
            type="checkbox"
            id="taxEnabled"
            checked={taxEnabled}
            onChange={(e) => setTaxEnabled(e.target.checked)}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="taxEnabled" className="text-sm font-medium text-gray-700">
            Enable Tax Calculation
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Tax Rate
          </label>
          <select
            value={defaultTaxRate}
            onChange={(e) => setDefaultTaxRate(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="0">No Tax (0%)</option>
            <option value="0.05">GST 5%</option>
            <option value="0.12">GST 12%</option>
            <option value="0.18">GST 18%</option>
            <option value="0.28">GST 28%</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This rate will be applied to new menu items by default
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Tax Rates</h3>
            <button className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 text-sm font-medium">
              <Plus className="h-4 w-4" />
              <span>Add Tax Rate</span>
            </button>
          </div>

          <div className="space-y-3">
            {taxRates.map((rate) => (
              <div key={rate.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{rate.name}</p>
                  <p className="text-sm text-gray-600">{(rate.rate * 100).toFixed(2)}%</p>
                </div>
                <div className="flex space-x-2">
                  {rate.isDefault && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                  <button className="p-2 text-blue-600 hover:text-blue-800">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">GST Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 5% GST: Basic food items, non-AC restaurants</li>
            <li>• 12% GST: Processed food items</li>
            <li>• 18% GST: AC restaurants, premium items</li>
            <li>• 28% GST: Luxury items, tobacco products</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
