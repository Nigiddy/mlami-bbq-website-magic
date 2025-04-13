
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseClient } from '@/lib/supabase';
import { MenuItem } from '@/lib/supabase';

interface Category {
  id: number;
  name: string;
}

interface MenuItemFormProps {
  menuItem?: MenuItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const MenuItemForm = ({ menuItem, onSuccess, onCancel }: MenuItemFormProps) => {
  const isEditing = !!menuItem;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: menuItem?.name || '',
    description: menuItem?.description || '',
    price: menuItem ? (menuItem.price / 100).toFixed(2) : '', // Convert cents to dollars for display
    category_id: menuItem?.category_id?.toString() || '',
    in_stock: menuItem?.in_stock !== undefined ? menuItem.in_stock : true,
    image_url: menuItem?.image_url || ''
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('categories')
          .select('id, name');
          
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive',
        });
      }
    };

    fetchCategories();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category_id: value }));
  };

  const handleStockChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, in_stock: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.price) {
        toast({
          title: 'Validation Error',
          description: 'Name and price are required',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Convert price to cents for storage
      const priceInCents = Math.round(parseFloat(formData.price) * 100);
      
      const supabase = getSupabaseClient();
      
      // Handle image URL
      let imageUrl = formData.image_url;
      if (!imageUrl) {
        // Use default image if none provided
        imageUrl = "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png";
      }
      
      // Prepare data object
      const menuItemData = {
        name: formData.name,
        description: formData.description,
        price: priceInCents,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        in_stock: formData.in_stock,
        image_url: imageUrl
      };
      
      let result;
      
      if (isEditing && menuItem) {
        // Update existing menu item
        result = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', menuItem.id);
      } else {
        // Insert new menu item
        result = await supabase
          .from('menu_items')
          .insert(menuItemData);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: isEditing ? 'Menu item updated successfully' : 'Menu item added successfully',
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error saving menu item:', err);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} menu item`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name*</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Item name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            name="description" 
            value={formData.description || ''} 
            onChange={handleChange} 
            placeholder="Item description"
            className="resize-none"
          />
        </div>
        
        <div>
          <Label htmlFor="price">Price (Ksh)*</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            value={formData.price} 
            onChange={handleChange} 
            placeholder="0.00" 
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category_id} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input 
            id="image_url" 
            name="image_url" 
            value={formData.image_url} 
            onChange={handleChange} 
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to use default image</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="in_stock" 
            checked={formData.in_stock} 
            onCheckedChange={handleStockChange}
          />
          <Label htmlFor="in_stock" className="cursor-pointer">In Stock</Label>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;
