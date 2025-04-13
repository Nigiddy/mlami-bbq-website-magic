
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, BadgePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { getSupabaseClient } from '@/lib/supabase';
import { MenuItem } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import MenuItemForm from './MenuItemForm';

const InventoryManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>(undefined);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      
      // Safely get the Supabase client
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');
      
      if (error) throw error;
      
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvailabilityToggle = async (id: number, inStock: boolean) => {
    try {
      setIsUpdating(id);
      
      // Safely get the Supabase client
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('menu_items')
        .update({ in_stock: inStock })
        .eq('id', id);
      
      if (error) throw error;
      
      setMenuItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, in_stock: inStock } : item
        )
      );
      
      toast({
        title: 'Success',
        description: `Item marked as ${inStock ? 'in stock' : 'out of stock'}`,
      });
    } catch (err) {
      console.error('Error updating item availability:', err);
      toast({
        title: 'Error',
        description: 'Failed to update item availability',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleAddItem = () => {
    setSelectedItem(undefined);
    setShowForm(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedItem(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedItem(undefined);
    fetchMenuItems();
  };

  const filteredItems = menuItems
    ? menuItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          <Button variant="outline" onClick={handleFormCancel}>Back to List</Button>
        </div>
        <MenuItemForm 
          menuItem={selectedItem} 
          onSuccess={handleFormSuccess} 
          onCancel={handleFormCancel} 
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search menu items..."
              disabled
              className="pl-10"
            />
          </div>
          <Button disabled className="ml-2">
            <BadgePlus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white/40 rounded-lg overflow-hidden flex">
              <Skeleton className="w-24 h-24" />
              <div className="p-3 flex-1">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-16 mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="ml-2" onClick={handleAddItem}>
          <BadgePlus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white/40 rounded-lg overflow-hidden flex">
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={item.image_url || "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between relative">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-bbq-orange">Ksh {(item.price / 100).toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Toggle
                  aria-label="Toggle item availability"
                  pressed={item.in_stock}
                  onPressedChange={(pressed) => handleAvailabilityToggle(item.id, pressed)}
                  disabled={isUpdating === item.id}
                  className={item.in_stock ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}
                >
                  {item.in_stock ? 'In Stock' : 'Out of Stock'}
                </Toggle>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8" 
                  onClick={() => handleEditItem(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
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
