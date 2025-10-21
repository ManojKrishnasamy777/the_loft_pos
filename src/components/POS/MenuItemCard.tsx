import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../../types';
import { usePOS } from '../../contexts/POSContext';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = usePOS();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-200 relative touch-manipulation">
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
          onClick={() => addToCart(item)}
          className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-amber-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-lg touch-manipulation"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>

      <div className="p-2 sm:p-3 lg:p-4">
        <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 hidden sm:block">{item.description}</p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-base sm:text-lg font-bold text-amber-600">₹{item.price}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[80px]">
            {item.category.name}
          </span>
        </div>
      </div>
    </div>
  );
}