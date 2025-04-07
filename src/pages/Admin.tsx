
import { useState } from 'react';
import Layout from '../components/Layout';
import AdminSidebar from '../components/admin/AdminSidebar';
import OrdersTable from '../components/admin/OrdersTable';
import OrderDetails from '../components/admin/OrderDetails';
import StatsCards from '../components/admin/StatsCards';
import InventoryManagement from '../components/admin/InventoryManagement';
import { useCart } from '@/contexts/CartContext';

const Admin = () => {
  const { orders } = useCart();
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'inventory'>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#ffefdb] to-[#ffdcc3] p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
            
            {/* Main Content */}
            <div className="flex-1">
              {activeView === 'dashboard' && (
                <div className="space-y-6">
                  <StatsCards />
                  
                  <div className="backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
                    <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                    <OrdersTable 
                      orders={orders.slice(0, 5)} 
                      onSelectOrder={setSelectedOrder}
                      showPagination={false}
                    />
                  </div>
                </div>
              )}
              
              {activeView === 'orders' && (
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-3/5 backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
                    <h2 className="text-xl font-semibold mb-4">Orders Management</h2>
                    <OrdersTable 
                      orders={orders} 
                      onSelectOrder={setSelectedOrder}
                      showPagination={true}
                    />
                  </div>
                  
                  <div className="lg:w-2/5 backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
                    <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                    {selectedOrder !== null ? (
                      <OrderDetails 
                        order={orders.find(o => o.id === selectedOrder)} 
                      />
                    ) : (
                      <p className="text-gray-500">Select an order to view details</p>
                    )}
                  </div>
                </div>
              )}
              
              {activeView === 'inventory' && (
                <div className="backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
                  <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
                  <InventoryManagement />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
