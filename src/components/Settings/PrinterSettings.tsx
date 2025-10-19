import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

interface PrinterConfig {
  id: number;
  name: string;
  type: 'EPSON' | 'STAR' | 'GENERIC';
  interface_type: 'USB' | 'NETWORK';
  usb_identifier: string | null;
  network_ip: string | null;
  network_port: number;
  is_default: boolean;
}

export function PrinterSettings() {
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EPSON' as 'EPSON' | 'STAR' | 'GENERIC',
    interface_type: 'USB' as 'USB' | 'NETWORK',
    usb_identifier: '',
    network_ip: '',
    network_port: 9100,
    is_default: false,
  });

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://theloftpos.metabustech.com/api/printer-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPrinters(data);
      }
    } catch (error) {
      console.error('Failed to load printers:', error);
      toast.error('Failed to load printers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const url = editingId
        ? `https://theloftpos.metabustech.com/api/printer-config/${editingId}`
        : 'https://theloftpos.metabustech.com/api/printer-config';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingId ? 'Printer updated successfully' : 'Printer added successfully');
        resetForm();
        loadPrinters();
      } else {
        toast.error('Failed to save printer');
      }
    } catch (error) {
      console.error('Error saving printer:', error);
      toast.error('Error saving printer');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this printer?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://theloftpos.metabustech.com/api/printer-config/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Printer deleted successfully');
        loadPrinters();
      } else {
        toast.error('Failed to delete printer');
      }
    } catch (error) {
      console.error('Error deleting printer:', error);
      toast.error('Error deleting printer');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://theloftpos.metabustech.com/api/printer-config/${id}/set-default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Default printer updated');
        loadPrinters();
      } else {
        toast.error('Failed to set default printer');
      }
    } catch (error) {
      console.error('Error setting default printer:', error);
      toast.error('Error setting default printer');
    }
  };

  const handleTestPrint = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://theloftpos.metabustech.com/api/print/test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Test print sent successfully');
      } else {
        toast.error(`Test print failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing printer:', error);
      toast.error('Error testing printer');
    }
  };

  const handleEdit = (printer: PrinterConfig) => {
    setEditingId(printer.id);
    setFormData({
      name: printer.name,
      type: printer.type,
      interface_type: printer.interface_type,
      usb_identifier: printer.usb_identifier || '',
      network_ip: printer.network_ip || '',
      network_port: printer.network_port,
      is_default: printer.is_default,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'EPSON',
      interface_type: 'USB',
      usb_identifier: '',
      network_ip: '',
      network_port: 9100,
      is_default: false,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-2 text-gray-600">Loading printers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thermal Printer Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">Manage USB and Network thermal printers</p>
          </div>
          <button
            onClick={handleTestPrint}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Test Print</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors mb-4"
          >
            <Plus className="h-4 w-4" />
            <span>Add Printer</span>
          </button>
        )}

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Printer' : 'Add New Printer'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Printer Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Main Counter Printer"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Printer Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="EPSON">EPSON</option>
                  <option value="STAR">STAR</option>
                  <option value="GENERIC">GENERIC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Type
                </label>
                <select
                  value={formData.interface_type}
                  onChange={(e) => setFormData({ ...formData, interface_type: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="USB">USB</option>
                  <option value="NETWORK">Network</option>
                </select>
              </div>

              {formData.interface_type === 'USB' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    USB Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.usb_identifier}
                    onChange={(e) => setFormData({ ...formData, usb_identifier: e.target.value })}
                    placeholder="POS-80 or leave empty for default"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.interface_type === 'NETWORK' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IP Address
                    </label>
                    <input
                      type="text"
                      value={formData.network_ip}
                      onChange={(e) => setFormData({ ...formData, network_ip: e.target.value })}
                      required
                      placeholder="192.168.1.100"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port
                    </label>
                    <input
                      type="number"
                      value={formData.network_port}
                      onChange={(e) => setFormData({ ...formData, network_port: parseInt(e.target.value) })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                Set as default printer
              </label>
            </div>

            <div className="mt-4 flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingId ? 'Update' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {printers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No printers configured. Add a printer to get started.
            </div>
          ) : (
            printers.map((printer) => (
              <div
                key={printer.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-amber-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{printer.name}</h4>
                      {printer.is_default && (
                        <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <div>Type: {printer.type}</div>
                      <div>Connection: {printer.interface_type}</div>
                      {printer.interface_type === 'USB' && printer.usb_identifier && (
                        <div>USB: {printer.usb_identifier}</div>
                      )}
                      {printer.interface_type === 'NETWORK' && (
                        <div>
                          Network: {printer.network_ip}:{printer.network_port}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!printer.is_default && (
                      <button
                        onClick={() => handleSetDefault(printer.id)}
                        className="text-sm text-amber-600 hover:text-amber-700"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(printer)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(printer.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
