import { useState } from 'react';
import { Save, Lock, Key, Shield } from 'lucide-react';
import { apiClient } from '../../config/api';

export function SecuritySettings() {
  const [requirePin, setRequirePin] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState('medium');

  const handleSave = async () => {
    try {
      await apiClient.updateSetting('security', {
        value: {
          requirePin,
          sessionTimeout,
          twoFactorAuth,
          passwordPolicy
        }
      });
      alert('Security settings saved successfully!');
    } catch (error) {
      console.error('Failed to save security settings:', error);
      alert('Failed to save security settings. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure security and access control</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Lock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Require PIN for Transactions</p>
              <p className="text-sm text-gray-600">Staff must enter PIN to complete orders</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={requirePin}
              onChange={(e) => setRequirePin(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Key className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add extra layer of security for admin accounts</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={(e) => setTwoFactorAuth(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <select
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="0">Never (not recommended)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Automatically log out inactive users after specified time
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Policy
          </label>
          <select
            value={passwordPolicy}
            onChange={(e) => setPasswordPolicy(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="low">Low (6+ characters)</option>
            <option value="medium">Medium (8+ chars, numbers)</option>
            <option value="high">High (10+ chars, numbers, symbols)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Minimum requirements for user passwords
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">Security Recommendations</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Enable two-factor authentication for all admin accounts</li>
                <li>• Use strong, unique passwords for each account</li>
                <li>• Regularly review user access and permissions</li>
                <li>• Keep your system software up to date</li>
              </ul>
            </div>
          </div>
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
