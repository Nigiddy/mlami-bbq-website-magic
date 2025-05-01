
import React, { useState } from 'react';
import { useOrders, OrderWithDetails } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const CookDashboard: React.FC = () => {
  const { orders, isLoading, updateOrderStatus } = useOrders();
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { toast } = useToast();

  // Filter orders by table number if selected
  const filteredOrders = orders.filter(order => {
    if (selectedTableFilter && order.table_number !== selectedTableFilter) {
      return false;
    }
    
    // Filter by status based on the active tab
    switch (activeTab) {
      case 'pending':
        return order.status === 'Pending';
      case 'preparing':
        return order.status === 'Preparing';
      case 'ready':
        return order.status === 'Ready';
      case 'all':
        return true;
      default:
        return true;
    }
  });

  // Extract unique table numbers for filtering
  const uniqueTableNumbers = Array.from(new Set(orders.map(order => order.table_number)))
    .filter(Boolean) // Remove null/undefined values
    .sort();

  // Update order status
  const handleStatusUpdate = async (order: OrderWithDetails, newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast({
        title: 'Status Updated',
        description: `Order #${order.id} is now ${newStatus}`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update the order status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Mark item as out of stock
  const markItemOutOfStock = (itemId: number, itemName: string) => {
    // This would be implemented in the inventory management
    toast({
      title: 'Item Marked Out of Stock',
      description: `${itemName} has been marked as out of stock`,
      variant: 'default',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Orders...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-bbq-orange"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <ChefHat className="mr-2 h-6 w-6 text-bbq-orange" />
            <CardTitle>Cook Dashboard</CardTitle>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Input 
                placeholder="Filter by Table #"
                value={selectedTableFilter}
                onChange={(e) => setSelectedTableFilter(e.target.value)}
                className="w-32 sm:w-40"
              />
              {selectedTableFilter && (
                <Button 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3" 
                  onClick={() => setSelectedTableFilter('')}
                >
                  ✕
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="all">All Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <div className={`p-2 ${
                        order.status === 'Pending' ? 'bg-yellow-100' : 
                        order.status === 'Preparing' ? 'bg-blue-100' :
                        order.status === 'Ready' ? 'bg-green-100' :
                        order.status === 'Served' ? 'bg-purple-100' :
                        order.status === 'Completed' ? 'bg-green-100' :
                        'bg-red-100'
                      }`}>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="bg-white">
                            Table #{order.table_number || 'N/A'}
                          </Badge>
                          <div className="flex items-center text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">Order #{order.id.toString().padStart(4, '0')}</h3>
                        
                        <div className="space-y-3">
                          <ul className="space-y-1">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="flex justify-between text-sm">
                                <span>
                                  {item.quantity}x {item.menu_item?.name || `Item #${item.menu_item_id}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4 space-y-2">
                          {order.status === 'Pending' && (
                            <Button 
                              className="w-full bg-blue-500 hover:bg-blue-600"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(order, 'Preparing')}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Start Preparing
                            </Button>
                          )}
                          
                          {order.status === 'Preparing' && (
                            <Button 
                              className="w-full bg-green-500 hover:bg-green-600"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(order, 'Ready')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Ready
                            </Button>
                          )}
                          
                          {order.status === 'Ready' && (
                            <Button 
                              className="w-full bg-purple-500 hover:bg-purple-600"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(order, 'Served')}
                            >
                              Mark Served
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            className="w-full text-red-500 border-red-200 hover:bg-red-50"
                            disabled={isUpdating || ['Cancelled', 'Completed'].includes(order.status)}
                            onClick={() => handleStatusUpdate(order, 'Cancelled')}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Mark Out of Stock
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No {activeTab !== 'all' ? activeTab : ''} orders found
                  {selectedTableFilter ? ` for Table #${selectedTableFilter}` : ''}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Stock Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Mark items as out of stock directly from the Inventory Management tab
          </p>
          <Button
            onClick={() => setActiveTab('inventory')}
            variant="outline"
            className="w-full"
          >
            Go to Inventory Management
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookDashboard;
