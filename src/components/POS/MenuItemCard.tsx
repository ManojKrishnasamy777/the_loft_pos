import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { MenuItem, Addon } from '../../types';
import { usePOS } from '../../contexts/POSContext';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = usePOS();
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/addons/active', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const data = await response.json();
      setAvailableAddons(data);
    } catch (err) {
      console.error('Failed to load addons:', err);
    }
  };

  const handleAddToCart = () => {
    if (availableAddons.length > 0) {
      setShowAddonModal(true);
    } else {
      addToCart(item, []);
    }
  };

  const handleConfirmAddons = () => {
    addToCart(item, selectedAddons);
    setSelectedAddons([]);
    setShowAddonModal(false);
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-gray-200 relative">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-4xl font-light">
                {item.name.charAt(0)}
              </span>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700 transition-colors shadow-lg"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-amber-600">₹{item.price}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {item.category.name}
            </span>
          </div>
        </div>
      </div>

      {showAddonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Add-ons</h3>
              <button
                onClick={() => {
                  setShowAddonModal(false);
                  setSelectedAddons([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Adding: {item.name}</p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableAddons.map(addon => (
                <label
                  key={addon.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedAddons.some(a => a.id === addon.id)}
                      onChange={() => toggleAddon(addon)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-900">{addon.name}</span>
                  </div>
                  <span className="text-amber-600 font-medium">+₹{addon.price.toFixed(2)}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddonModal(false);
                  setSelectedAddons([]);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddons}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}