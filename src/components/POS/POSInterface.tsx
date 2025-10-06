import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, CreditCard, Printer } from 'lucide-react';
import { mockMenuItems, mockCategories, loadMenuData } from '../../data/mockData';
import { usePOS } from '../../contexts/POSContext';
import { PaymentMethod } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { Cart } from './Cart';
import { PaymentModal } from './PaymentModal';
import { apiClient } from '../../config/api';
import { PrintService } from '../../services/printService';

export function POSInterface() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const { cart, calculateTotals, clearCart } = usePOS();

  useEffect(() => {
    loadMenuData();
    fetchMenuItems();
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
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Current Order ({cart.length})
            </h2>
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
              onClick={async () => {
                if (lastOrder) {
                  await PrintService.printReceipt(lastOrder, {
                    showLogo: true,
                    showGst: true,
                    showQr: false
                  });
                } else {
                  alert('No order to print. Complete an order first.');
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
          onClose={() => {
            setShowPaymentModal(false);
          }}
          onSuccess={async (order) => {
            setLastOrder(order);
            const settings = await apiClient.getSettings();
            const autoPrint = settings.find((s: any) => s.key === 'auto_print')?.value === 'true';

            if (autoPrint) {
              await PrintService.printReceipt(order, {
                showLogo: true,
                showGst: true,
                showQr: false
              });
            }
          }}
        />
      )}
    </div>
  );
}