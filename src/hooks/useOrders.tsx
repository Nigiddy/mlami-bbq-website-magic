
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Order, OrderItem } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export type OrderWithDetails = Order & {
  items: (OrderItem & {
    menu_item: {
      name: string;
      image_url: string | null;
    };
  })[];
  customer: {
    name: string | null;
    phone: string | null;
  };
};

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        // Safely get the Supabase client
        const supabase = getSupabaseClient();
        
        // Fetch orders with customer info
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            customers:customer_id (
              name, 
              phone
            )
          `)
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        if (!ordersData) {
          setOrders([]);
          return;
        }

        // For each order, fetch the associated order items with menu item details
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: orderItems, error: itemsError } = await supabase
              .from('order_items')
              .select(`
                *,
                menu_item:menu_item_id (
                  name,
                  image_url
                )
              `)
              .eq('order_id', order.id);
            
            if (itemsError) throw itemsError;
            
            return {
              ...order,
              customer: order.customers,
              items: orderItems || [],
              // Format dates for easier use in components
              createdAt: order.created_at,
              updatedAt: order.updated_at
            };
          })
        );
        
        setOrders(ordersWithItems);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      // Safely get the Supabase client
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, status } : order
        )
      );
      
      toast({
        title: 'Success',
        description: `Order status updated to ${status}`,
      });
      
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { orders, isLoading, error, updateOrderStatus };
};
