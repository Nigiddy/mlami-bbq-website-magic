
import { useState } from 'react';
import Layout from '@/components/Layout';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatsCards from '@/components/admin/StatsCards';
import OrdersTable from '@/components/admin/OrdersTable';
import InventoryManagement from '@/components/admin/InventoryManagement';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import OrderDetails from '@/components/admin/OrderDetails';
import { useCart } from '@/contexts/CartContext';

const Admin = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'inventory' | 'qrcodes'>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { orders } = useCart();

  const selectedOrder = selectedOrderId 
    ? orders.find(order => order.id === selectedOrderId) 
    : null;

  return (
    <Layout>
      <div className="py-10 container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
          
          <div className="flex-1">
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <StatsCards />
              </div>
            )}
            
            {activeView === 'orders' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-semibold">Orders</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <OrdersTable 
                      onSelectOrder={(id) => setSelectedOrderId(id)} 
                      showPagination={true}
                    />
                  </div>
                  <div className="backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
                    {selectedOrder ? (
                      <OrderDetails order={selectedOrder} />
                    ) : (
                      <p className="text-gray-500 text-center py-10">
                        Select an order to view details
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeView === 'inventory' && <InventoryManagement />}
            {activeView === 'qrcodes' && <QRCodeGenerator />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
