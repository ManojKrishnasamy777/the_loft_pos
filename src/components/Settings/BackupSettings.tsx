import { useState } from 'react';
import { Download, Upload, Database, Clock, Save } from 'lucide-react';
import { apiClient } from '../../config/api';

export function BackupSettings() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupTime, setBackupTime] = useState('02:00');

  const backups = [
    { id: '1', date: '2024-01-15 02:00', size: '2.4 MB', status: 'completed' },
    { id: '2', date: '2024-01-14 02:00', size: '2.3 MB', status: 'completed' },
    { id: '3', date: '2024-01-13 02:00', size: '2.2 MB', status: 'completed' }
  ];

  const handleBackupNow = () => {
    alert('Manual backup initiated. This may take a few minutes.');
  };

  const handleRestore = (backupId: string) => {
    if (confirm('Are you sure you want to restore this backup? This will replace current data.')) {
      alert('Restore initiated. Please do not close the application.');
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.updateSetting('backup', {
        value: {
          auto: autoBackup,
          frequency: backupFrequency,
          time: backupTime
        }
      });
      alert('Backup settings saved successfully!');
    } catch (error) {
      console.error('Failed to save backup settings:', error);
      alert('Failed to save backup settings. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Backup & Restore</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your data backups and restoration</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Automatic Backups</p>
              <p className="text-sm text-gray-600">Regularly backup your data automatically</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        {autoBackup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Time
              </label>
              <input
                type="time"
                value={backupTime}
                onChange={(e) => setBackupTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Manual Actions</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleBackupNow}
              className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Database className="h-4 w-4" />
              <span>Backup Now</span>
            </button>

            <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Restore Backup</span>
            </button>

            <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Backups</h3>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{backup.date}</p>
                    </div>
                    <p className="text-xs text-gray-600">Size: {backup.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    {backup.status}
                  </span>
                  <button
                    onClick={() => handleRestore(backup.id)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Backup Best Practices</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep backups in multiple locations for safety</li>
            <li>• Test restore process regularly to ensure data integrity</li>
            <li>• Backups are stored securely and encrypted</li>
            <li>• Retain at least 30 days of backup history</li>
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
