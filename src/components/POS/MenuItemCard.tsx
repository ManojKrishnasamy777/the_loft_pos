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
          onClick={() => addToCart(item)}
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
  );
}