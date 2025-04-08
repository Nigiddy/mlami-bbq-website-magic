
import { ArrowUpIcon, ArrowDownIcon, Clock } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';

const StatsCards = () => {
  const { orders, isLoading } = useOrders();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-baseline">
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="mt-4 flex items-center">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Calculate stats
  const pendingOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status.toLowerCase())).length;
  
  const today = new Date().setHours(0, 0, 0, 0);
  const completedToday = orders.filter(o => {
    const orderDate = new Date(o.created_at).setHours(0, 0, 0, 0);
    return orderDate === today && o.status.toLowerCase() === 'completed';
  }).length;
  
  const totalRevenue = orders
    .filter(o => o.status.toLowerCase() !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total), 0);

  // Dummy data for trends - in real app this would be calculated from historical data
  const pendingTrend = 5.7;
  const revenueTrend = 12.8;
  const completedTrend = -2.3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium text-gray-500">Pending Orders</h3>
          <div className={`flex items-center ${pendingTrend > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            {pendingTrend > 0 ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
            <span className="text-sm">{Math.abs(pendingTrend)}%</span>
          </div>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{pendingOrders}</span>
          <span className="ml-2 text-sm text-gray-500">orders</span>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Updated just now</span>
        </div>
      </div>
      
      <div className="backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium text-gray-500">Today's Revenue</h3>
          <div className={`flex items-center ${revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueTrend > 0 ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
            <span className="text-sm">{Math.abs(revenueTrend)}%</span>
          </div>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">Ksh {totalRevenue.toLocaleString()}</span>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Updated just now</span>
        </div>
      </div>
      
      <div className="backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium text-gray-500">Orders Completed</h3>
          <div className={`flex items-center ${completedTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {completedTrend > 0 ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
            <span className="text-sm">{Math.abs(completedTrend)}%</span>
          </div>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{completedToday}</span>
          <span className="ml-2 text-sm text-gray-500">today</span>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Updated just now</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
