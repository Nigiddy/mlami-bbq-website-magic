
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('menu_items')
          .select('*');
        
        if (error) throw error;
        
        setMenuItems(data || []);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items');
        toast({
          title: 'Error',
          description: 'Failed to load menu items',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [toast]);

  return { menuItems, isLoading, error };
};
