import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { usePOS } from '../../contexts/POSContext';

export function Cart() {
  const { cart, updateQuantity, removeFromCart } = usePOS();

  if (cart.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No items in cart</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto max-h-96">
      <div className="divide-y divide-gray-200">
        {cart.map(({ menuItem, quantity, addons }, index) => {
          const itemPrice = menuItem.price;
          const addonsPrice = (addons || []).reduce((sum, addon) => sum + addon.price, 0);
          const totalItemPrice = (itemPrice + addonsPrice) * quantity;

          return (
            <div key={`${menuItem.id}-${index}`} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {menuItem.image ? (
                    <img
                      src={menuItem.image}
                      alt={menuItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                      {menuItem.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{menuItem.name}</h4>
                  <p className="text-sm text-gray-500">₹{menuItem.price} each</p>

                  {addons && addons.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-600">Add-ons:</p>
                      {addons.map(addon => (
                        <p key={addon.id} className="text-xs text-gray-500">
                          + {addon.name} (₹{addon.price.toFixed(2)})
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="w-8 text-center text-sm font-medium">
                        {quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        ₹{totalItemPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(menuItem.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}