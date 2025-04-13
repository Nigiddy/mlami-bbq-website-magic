
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatsCards from '@/components/admin/StatsCards';
import OrdersTable from '@/components/admin/OrdersTable';
import InventoryManagement from '@/components/admin/InventoryManagement';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import OrderDetails from '@/components/admin/OrderDetails';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const Admin = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'inventory' | 'qrcodes'>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { orders, isLoading } = useOrders();
  const { user, signOut } = useAuth();
  
  const selectedOrder = selectedOrderId 
    ? orders.find(order => order.id === selectedOrderId) 
    : null;

  return (
    <Layout>
      <div className="py-10 container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">
                {activeView === 'dashboard' && 'Dashboard'}
                {activeView === 'orders' && 'Orders'}
                {activeView === 'inventory' && 'Inventory Management'}
                {activeView === 'qrcodes' && 'QR Code Generator'}
              </h1>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    {user?.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                <StatsCards />
              </div>
            )}
            
            {activeView === 'orders' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <OrdersTable 
                      onSelectOrder={(id) => setSelectedOrderId(id)} 
                      showPagination={true}
                    />
                  </div>
                  <div className="backdrop-blur-md bg-white/60 rounded-xl p-6 shadow-lg border border-white/20">
                    <OrderDetails 
                      order={selectedOrder} 
                      isLoading={isLoading && selectedOrderId !== null}
                    />
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
