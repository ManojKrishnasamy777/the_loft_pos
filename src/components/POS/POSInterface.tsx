import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, CreditCard, Printer, Users, Layers, Plus } from 'lucide-react';
import { mockMenuItems, mockCategories, loadMenuData } from '../../data/mockData';
import { usePOS } from '../../contexts/POSContext';
import { PaymentMethod, Customer, Screen, Receipt } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { Cart } from './Cart';
import { PaymentModal } from './PaymentModal';
import { apiClient } from '../../config/api';
import toast from 'react-hot-toast';

export function POSInterface() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({ name: '', email: '', phone: '' });
  const { cart, calculateTotals, clearCart } = usePOS();

  useEffect(() => {
    loadMenuData();
    fetchMenuItems();
    fetchCustomers();
    fetchScreens();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        apiClient.getMenuItems(),
        apiClient.getCategories()
      ]);

      setMenuItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
      setMenuItems(mockMenuItems);
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await apiClient.getActiveCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchScreens = async () => {
    try {
      const data = await apiClient.getScreens();
      setScreens(data.filter((s: Screen) => s.isActive));
    } catch (error) {
      console.error('Failed to fetch screens:', error);
    }
  };

  const handlePrintReceipt = async (order: any) => {
    try {
      const settings = await apiClient.getSettings();
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      const receiptData = {
        storeName: settingsMap.company_name || 'The Loft Coimbatore',
        address: settingsMap.company_address || 'Coimbatore, Tamil Nadu',
        orderNumber: order.orderNumber || order.order_number,
        customerName: order.customer?.name || order.customer_name || 'Walk-in Customer',
        items: (order.items || order.orderItems || []).map((item: any) => ({
          name: item.menuItem?.name || item.name || 'Item',
          qty: item.quantity,
          price: item.price || item.menuItem?.price || 0,
        })),
        subtotal: order.subtotal || 0,
        tax: order.taxAmount || order.tax_amount || 0,
        total: order.total || 0,
        paymentMethod: order.payment?.paymentMethod || order.payment?.payment_method || 'Cash',
        qrCode: order.orderNumber || order.order_number,
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/print/receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(receiptData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Receipt printed successfully');
      } else {
        toast.error(`Print failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Error printing receipt');
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCustomer = await apiClient.createCustomer(customerFormData);
      setCustomers([...customers, newCustomer]);
      setSelectedCustomer(newCustomer.id);
      setShowCustomerForm(false);
      setCustomerFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const categoryId = item.categoryId || item.category?.id;
    const matchesCategory = selectedCategory === 'all' || categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = item.isActive !== undefined ? item.isActive : item.is_active;
    const isAvailable = item.isAvailable !== undefined ? item.isAvailable : item.is_available !== false;
    return matchesCategory && matchesSearch && isActive && isAvailable;
  });

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Menu Items */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Point of Sale</h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${selectedCategory === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              All Items
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${selectedCategory === category.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No items found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-white shadow-lg border-l">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Current Order ({cart.length})
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
              <div className="flex space-x-2">
                <select
                  value={selectedCustomer || ''}
                  onChange={(e) => setSelectedCustomer(e.target.value || null)}
                  className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="bg-amber-600 text-white p-1.5 rounded-md hover:bg-amber-700"
                  title="Add new customer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Screen</label>
              <select
                value={selectedScreen || ''}
                onChange={(e) => setSelectedScreen(e.target.value || null)}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select Screen</option>
                {screens.map(screen => (
                  <option key={screen.id} value={screen.id}>
                    {screen.name} {screen.capacity ? `(${screen.capacity} seats)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Cart />

        {/* Order Summary and Actions */}
        <div className="border-t p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax:</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Process Payment</span>
            </button>

            <button
              onClick={() => {
                if (lastOrder) {
                  handlePrintReceipt(lastOrder);
                } else {
                  toast.error('No order to print. Complete an order first.');
                }
              }}
              disabled={!lastOrder}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print Last Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          total={total}
          customerId={selectedCustomer}
          screenId={selectedScreen}
          onClose={() => {
            setShowPaymentModal(false);
          }}
          onSuccess={async (order) => {
            setLastOrder(order);
            setSelectedCustomer(null);
            setSelectedScreen(null);
            const settings = await apiClient.getSettings();
            const autoPrint = settings.find((s: any) => s.key === 'auto_print')?.value === 'true';

            if (autoPrint) {
              await handlePrintReceipt(order);
            }
          }}
        />
      )}

      {/* Quick Add Customer Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={customerFormData.email}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}