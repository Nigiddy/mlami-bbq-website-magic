
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { useOrders, OrderWithDetails } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderDetailsProps {
  order: OrderWithDetails | null;
  isLoading?: boolean;
}

const OrderDetails = ({ order, isLoading = false }: OrderDetailsProps) => {
  const { updateOrderStatus } = useOrders();
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-20 ml-auto" />
        </div>
        <div>
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-5 w-14 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="pt-4 space-y-2">
          <Skeleton className="h-5 w-32 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return <p className="text-center py-8">Select an order to view details</p>;
  }

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    await updateOrderStatus(order.id, status);
    setIsUpdating(false);
  };

  const getNextStatuses = () => {
    switch (order.status.toLowerCase()) {
      case 'pending': return ['Preparing'];
      case 'preparing': return ['Ready'];
      case 'ready': return ['Served'];
      case 'served': return ['Completed'];
      case 'completed': return [];
      case 'cancelled': return [];
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Order #{order.id.toString().padStart(4, '0')}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
            order.status === 'Ready' ? 'bg-green-100 text-green-800' :
            order.status === 'Served' ? 'bg-purple-100 text-purple-800' :
            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Customer</h4>
        <div className="bg-white/40 rounded-lg p-3">
          <p className="font-medium">{order.customer?.name || 'Guest'}</p>
          {order.customer?.phone && (
            <p className="flex items-center text-sm text-gray-600">
              <Phone className="h-3 w-3 mr-1" />
              {order.customer.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Items</h4>
        <div className="bg-white/40 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <li key={index} className="p-3 flex justify-between">
                <div>
                  <p className="font-medium">{item.menu_item?.name || 'Item #' + item.menu_item_id}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">Ksh {item.price}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white/40 p-3 rounded-lg">
        <div className="flex justify-between mb-2">
          <p>Subtotal</p>
          <p>Ksh {order.subtotal}</p>
        </div>
        <div className="flex justify-between font-bold">
          <p>Total</p>
          <p>Ksh {order.total}</p>
        </div>
      </div>

      {getNextStatuses().length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-2">Update Status</h4>
          <div className="flex flex-wrap gap-2">
            {getNextStatuses().map(status => (
              <Button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={isUpdating}
                className="bg-bbq-orange hover:bg-bbq-orange/80"
              >
                Mark as {status}
              </Button>
            ))}
            {!['Cancelled', 'Completed'].includes(order.status) && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('Cancelled')}
                disabled={isUpdating}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
