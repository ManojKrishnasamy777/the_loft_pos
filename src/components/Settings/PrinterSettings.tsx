import { useState, useEffect } from 'react';
import { Save, Printer, TestTube } from 'lucide-react';
import { apiClient } from '../../config/api';
import { PrintService } from '../../services/printService';

export function PrinterSettings() {
  const [printerType, setPrinterType] = useState('thermal');
  const [printerIp, setPrinterIp] = useState('');
  const [printerPort, setPrinterPort] = useState('9100');
  const [paperSize, setPaperSize] = useState('80mm');
  const [autoPrint, setAutoPrint] = useState(false);
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

      setPrinterType(settingsMap.printer_type || 'thermal');
      setPrinterIp(settingsMap.printer_ip || '');
      setPrinterPort(settingsMap.printer_port || '9100');
      setPaperSize(settingsMap.printer_paper_size || '80mm');
      setAutoPrint(settingsMap.auto_print === 'true');
    } catch (error) {
      console.error('Failed to load printer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await Promise.all([
        apiClient.updateSetting('printer_type', { value: printerType }),
        apiClient.updateSetting('printer_ip', { value: printerIp }),
        apiClient.updateSetting('printer_port', { value: printerPort }),
        apiClient.updateSetting('printer_paper_size', { value: paperSize }),
        apiClient.updateSetting('auto_print', { value: autoPrint.toString() }),
        apiClient.updateSetting('printer_enabled', { value: 'true' })
      ]);
      alert('Printer settings saved successfully!');
    } catch (error) {
      console.error('Failed to save printer settings:', error);
      alert('Failed to save printer settings. Please try again.');
    }
  };

  const handleTestPrint = async () => {
    try {
      await PrintService.testPrint();
    } catch (error) {
      console.error('Test print failed:', error);
      alert('Test print failed. Please check your printer configuration.');
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
        <h2 className="text-xl font-bold text-gray-900">Printer Configuration</h2>
        <p className="text-sm text-gray-600 mt-1">Configure receipt printer settings</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Printer Type
          </label>
          <select
            value={printerType}
            onChange={(e) => setPrinterType(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="thermal">Thermal Printer</option>
            <option value="inkjet">Inkjet Printer</option>
            <option value="laser">Laser Printer</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Printer IP Address
            </label>
            <input
              type="text"
              value={printerIp}
              onChange={(e) => setPrinterIp(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port
            </label>
            <input
              type="text"
              value={printerPort}
              onChange={(e) => setPrinterPort(e.target.value)}
              placeholder="9100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paper Size
          </label>
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="58mm">58mm (Small)</option>
            <option value="80mm">80mm (Standard)</option>
            <option value="a4">A4</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoPrint"
            checked={autoPrint}
            onChange={(e) => setAutoPrint(e.target.checked)}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="autoPrint" className="ml-2 text-sm text-gray-700">
            Automatically print receipt after order completion
          </label>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Receipt Format</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <input type="checkbox" id="showLogo" className="h-4 w-4 text-amber-600 rounded mr-2" defaultChecked />
              <label htmlFor="showLogo">Show theatre logo</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="showGst" className="h-4 w-4 text-amber-600 rounded mr-2" defaultChecked />
              <label htmlFor="showGst">Show GST details</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="showQr" className="h-4 w-4 text-amber-600 rounded mr-2" />
              <label htmlFor="showQr">Include QR code</label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
          <button
            onClick={handleTestPrint}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TestTube className="h-4 w-4" />
            <span>Test Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
