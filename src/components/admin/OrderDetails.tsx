
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Phone } from 'lucide-react';

interface OrderDetailsProps {
  order: any;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  const { updateOrderStatus } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) {
    return <p>Select an order to view details</p>;
  }

  const handleStatusUpdate = (status: string) => {
    setIsUpdating(true);
    setTimeout(() => {
      updateOrderStatus(order.id, status);
      setIsUpdating(false);
    }, 500);
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
            {new Date(order.createdAt).toLocaleString()}
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
          <p className="font-medium">{order.customer.name}</p>
          <p className="flex items-center text-sm text-gray-600">
            <Phone className="h-3 w-3 mr-1" />
            {order.customer.phone}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Items</h4>
        <div className="bg-white/40 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {order.items.map((item: any, index: number) => (
              <li key={index} className="p-3 flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">Ksh {item.price.replace(/\$/g, '')}</p>
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
