
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';

interface MenuItem {
  id: number;
  name: string;
  price: string;
  image: string;
  inStock: boolean;
}

const InventoryManagement = () => {
  const { menuItems, updateItemAvailability } = useCart();
  const [search, setSearch] = useState('');
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleAvailabilityToggle = (id: number, inStock: boolean) => {
    setIsUpdating(id);
    setTimeout(() => {
      updateItemAvailability(id, inStock);
      setIsUpdating(null);
    }, 300);
  };

  const filteredItems = menuItems
    ? menuItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white/40 rounded-lg overflow-hidden flex">
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-bbq-orange">Ksh {item.price.replace(/\$/g, '')}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Availability:</span>
                <Toggle
                  aria-label="Toggle item availability"
                  pressed={item.inStock}
                  onPressedChange={(pressed) => handleAvailabilityToggle(item.id, pressed)}
                  disabled={isUpdating === item.id}
                  className={item.inStock ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}
                >
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </Toggle>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center py-8 text-gray-500">No items found</p>
      )}
    </div>
  );
};

export default InventoryManagement;
