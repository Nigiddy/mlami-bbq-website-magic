
import { useState } from 'react';
import Layout from '@/components/Layout';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatsCards from '@/components/admin/StatsCards';
import OrdersTable from '@/components/admin/OrdersTable';
import InventoryManagement from '@/components/admin/InventoryManagement';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';

const Admin = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'inventory' | 'qrcodes'>('dashboard');

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
            
            {activeView === 'orders' && <OrdersTable />}
            {activeView === 'inventory' && <InventoryManagement />}
            {activeView === 'qrcodes' && <QRCodeGenerator />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
