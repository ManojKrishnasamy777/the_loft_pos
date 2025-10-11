import React, { useState } from 'react';
import {
  Settings,
  CreditCard,
  Printer,
  Calculator,
  Users,
  Shield,
  Bell,
  Database,
  Monitor,
  Mail,
  Key,
  MessageCircle
} from 'lucide-react';
import { PaymentSettings } from './PaymentSettings';
import { PrinterSettings } from './PrinterSettings';
import { TaxSettings } from './TaxSettings';
import { UserManagement } from './UserManagement';
import { SecuritySettings } from './SecuritySettings';
import { NotificationSettings } from './NotificationSettings';
import { BackupSettings } from './BackupSettings';
import { ScreenManagement } from '../Screens/screens';
import EmailSettings from './EmailSettings';
import { RoleManagement } from './RoleManagement';
import { PermissionManagement } from './PermissionManagement';
import { WhatsAppMessaging } from './WhatsAppMessaging';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('payment');

  const tabs = [
    { id: 'payment', name: 'Payment Gateway', icon: CreditCard },
    { id: 'printer', name: 'Thermal Printer', icon: Printer },
    { id: 'tax', name: 'Tax Settings', icon: Calculator },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'roles', name: 'Role Management', icon: Shield },
    { id: 'permissions', name: 'Permissions', icon: Key },
    { id: 'screen', name: 'Screens', icon: Monitor },
    { id: 'email', name: 'Email Configuration', icon: Mail },
    { id: 'whatsapp', name: 'WhatsApp Messaging', icon: MessageCircle },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'backup', name: 'Backup & Restore', icon: Database }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payment':
        return <PaymentSettings />;
      case 'printer':
        return <PrinterSettings />;
      case 'tax':
        return <TaxSettings />;
      case 'users':
        return <UserManagement />;
      case 'roles':
        return <RoleManagement />;
      case 'permissions':
        return <PermissionManagement />;
      case 'screen':
        return <ScreenManagement />;
      case 'email':
        return <EmailSettings />;
      case 'whatsapp':
        return <WhatsAppMessaging />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'backup':
        return <BackupSettings />;
      default:
        return <PaymentSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your POS system settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-amber-600" />
                  <h2 className="font-semibold text-gray-900">Settings Menu</h2>
                </div>
              </div>
              <nav className="p-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${activeTab === tab.id
                        ? 'bg-amber-100 text-amber-700 border-r-2 border-amber-600'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}