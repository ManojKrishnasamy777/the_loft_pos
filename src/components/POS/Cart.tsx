import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { usePOS } from '../../contexts/POSContext';

export function Cart() {
  const { cart, updateQuantity, removeFromCart } = usePOS();

  if (cart.length === 0) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <p className="text-sm sm:text-base text-gray-500">No items in cart</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-200">
        {cart.map(({ menuItem, quantity }) => (
          <div key={menuItem.id} className="p-3 sm:p-4 hover:bg-gray-50">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{menuItem.name}</h4>
                <p className="text-xs sm:text-sm text-gray-500">₹{menuItem.price} each</p>
                
                <div className="flex items-center justify-between mt-2 gap-2">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 touch-manipulation active:bg-gray-300"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">
                      {quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 touch-manipulation active:bg-gray-300"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-medium text-sm sm:text-base text-gray-900">
                      ₹{(menuItem.price * quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(menuItem.id)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md touch-manipulation active:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}