import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../../config/api';
import { MessageCircle, Upload, Send, Download, Users } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
}

interface Recipient {
  phone: string;
  name?: string;
  variables?: string[];
}

export function WhatsAppMessaging() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [languageCode, setLanguageCode] = useState('en');
  const [loading, setLoading] = useState(false);
  const [sendingMode, setSendingMode] = useState<'individual' | 'bulk' | 'file'>('individual');

  const [individualForm, setIndividualForm] = useState({
    phone: '',
    parameters: [''],
  });

  const [bulkRecipients, setBulkRecipients] = useState<Recipient[]>([
    { phone: '', name: '', variables: [''] },
  ]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await apiClient.request('/whatsapp/templates');
      setTemplates(response.templates || []);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      if (error.message.includes('not configured')) {
        toast.error('WhatsApp is not configured. Please set up credentials.');
      } else {
        toast.error('Failed to load WhatsApp templates');
      }
    }
  };

  const handleIndividualSend = async () => {
    if (!selectedTemplate || !individualForm.phone) {
      toast.error('Please select a template and enter phone number');
      return;
    }

    setLoading(true);
    try {
      await apiClient.request('/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({
          phone: individualForm.phone,
          templateName: selectedTemplate,
          languageCode,
          parameters: individualForm.parameters.filter(p => p.trim() !== ''),
        }),
      });

      toast.success('WhatsApp message sent successfully');
      setIndividualForm({ phone: '', parameters: [''] });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.message || 'Failed to send WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSend = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    const validRecipients = bulkRecipients.filter(r => r.phone.trim() !== '');
    if (validRecipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.request('/whatsapp/send-bulk', {
        method: 'POST',
        body: JSON.stringify({
          recipients: validRecipients.map(r => ({
            phone: r.phone,
            name: r.name,
            variables: r.variables?.filter(v => v.trim() !== ''),
          })),
          templateName: selectedTemplate,
          languageCode,
        }),
      });

      toast.success(`Messages sent! ${response.data.successful} successful, ${response.data.failed} failed`);
      setBulkRecipients([{ phone: '', name: '', variables: [''] }]);
    } catch (error: any) {
      console.error('Failed to send bulk messages:', error);
      toast.error(error.message || 'Failed to send bulk messages');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSend = async () => {
    if (!uploadedFile || !selectedTemplate) {
      toast.error('Please select a file and template');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('templateName', selectedTemplate);
      formData.append('languageCode', languageCode);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/whatsapp/send-bulk-csv`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`Messages sent! ${result.data.successful} successful, ${result.data.failed} failed`);
        setUploadedFile(null);
      } else {
        toast.error('Failed to send messages');
      }
    } catch (error: any) {
      console.error('Failed to send file messages:', error);
      toast.error('Failed to send messages from file');
    } finally {
      setLoading(false);
    }
  };

  const addBulkRecipient = () => {
    setBulkRecipients([...bulkRecipients, { phone: '', name: '', variables: [''] }]);
  };

  const removeBulkRecipient = (index: number) => {
    setBulkRecipients(bulkRecipients.filter((_, i) => i !== index));
  };

  const updateBulkRecipient = (index: number, field: keyof Recipient, value: any) => {
    const updated = [...bulkRecipients];
    updated[index] = { ...updated[index], [field]: value };
    setBulkRecipients(updated);
  };

  const downloadSampleCSV = () => {
    const csv = 'phone,name,var1,var2\n919876543210,John Doe,Parameter1,Parameter2\n919876543211,Jane Smith,Parameter1,Parameter2';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whatsapp-sample.csv';
    a.click();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">WhatsApp Bulk Messaging</h2>
            <p className="text-sm text-gray-600 mt-1">Send promotional messages using WhatsApp Business API</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Choose a template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.name}>
                {template.name} ({template.language}) - {template.status}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Templates must be approved by WhatsApp before use
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language Code</label>
          <input
            type="text"
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="en"
          />
        </div>

        <div className="border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setSendingMode('individual')}
              className={`pb-3 border-b-2 transition-colors ${
                sendingMode === 'individual'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send className="h-4 w-4 inline-block mr-2" />
              Individual
            </button>
            <button
              onClick={() => setSendingMode('bulk')}
              className={`pb-3 border-b-2 transition-colors ${
                sendingMode === 'bulk'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4 inline-block mr-2" />
              Bulk Entry
            </button>
            <button
              onClick={() => setSendingMode('file')}
              className={`pb-3 border-b-2 transition-colors ${
                sendingMode === 'file'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="h-4 w-4 inline-block mr-2" />
              File Upload
            </button>
          </div>
        </div>

        {sendingMode === 'individual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                value={individualForm.phone}
                onChange={(e) => setIndividualForm({ ...individualForm, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="919876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Parameters</label>
              {individualForm.parameters.map((param, index) => (
                <input
                  key={index}
                  type="text"
                  value={param}
                  onChange={(e) => {
                    const updated = [...individualForm.parameters];
                    updated[index] = e.target.value;
                    setIndividualForm({ ...individualForm, parameters: updated });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={`Parameter ${index + 1}`}
                />
              ))}
              <button
                onClick={() => setIndividualForm({ ...individualForm, parameters: [...individualForm.parameters, ''] })}
                className="text-sm text-green-600 hover:text-green-700"
              >
                + Add Parameter
              </button>
            </div>

            <button
              onClick={handleIndividualSend}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        )}

        {sendingMode === 'bulk' && (
          <div className="space-y-4">
            {bulkRecipients.map((recipient, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-gray-700">Recipient {index + 1}</h4>
                  {bulkRecipients.length > 1 && (
                    <button
                      onClick={() => removeBulkRecipient(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={recipient.phone}
                  onChange={(e) => updateBulkRecipient(index, 'phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Phone: 919876543210"
                />
                <input
                  type="text"
                  value={recipient.name || ''}
                  onChange={(e) => updateBulkRecipient(index, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Name (optional)"
                />
              </div>
            ))}

            <button
              onClick={addBulkRecipient}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              + Add Recipient
            </button>

            <button
              onClick={handleBulkSend}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send to All</span>
                </>
              )}
            </button>
          </div>
        )}

        {sendingMode === 'file' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV/Excel File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {uploadedFile ? (
                  <div>
                    <p className="text-sm text-gray-700 font-medium">{uploadedFile.name}</p>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-sm text-red-600 hover:text-red-700 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload CSV or Excel file</p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">CSV Format</h4>
              <p className="text-sm text-blue-800 mb-2">
                Your CSV should have columns: phone, name (optional), var1, var2, etc.
              </p>
              <button
                onClick={downloadSampleCSV}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            <button
              onClick={handleFileSend}
              disabled={loading || !uploadedFile}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send from File</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
