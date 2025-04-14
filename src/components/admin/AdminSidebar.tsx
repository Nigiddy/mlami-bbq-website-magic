
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, Package, QrCode, Users } from 'lucide-react';

type AdminViewType = 'dashboard' | 'orders' | 'inventory' | 'qrcodes' | 'users';

interface AdminSidebarProps {
  activeView: AdminViewType;
  setActiveView: (view: AdminViewType) => void;
}

const AdminSidebar = ({ activeView, setActiveView }: AdminSidebarProps) => {
  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      value: 'dashboard' as AdminViewType
    },
    {
      title: 'Orders',
      icon: <ShoppingBag className="h-5 w-5" />,
      value: 'orders' as AdminViewType
    },
    {
      title: 'Inventory',
      icon: <Package className="h-5 w-5" />,
      value: 'inventory' as AdminViewType
    },
    {
      title: 'QR Codes',
      icon: <QrCode className="h-5 w-5" />,
      value: 'qrcodes' as AdminViewType
    },
    {
      title: 'User Management',
      icon: <Users className="h-5 w-5" />,
      value: 'users' as AdminViewType
    }
  ];

  return (
    <div className="w-full md:w-64 space-y-2">
      {navItems.map((item) => (
        <Button
          key={item.value}
          variant={activeView === item.value ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            activeView === item.value ? "bg-bbq-orange hover:bg-bbq-orange/90" : ""
          )}
          onClick={() => setActiveView(item.value)}
        >
          <span className="mr-2">{item.icon}</span>
          {item.title}
        </Button>
      ))}
    </div>
  );
};

export default AdminSidebar;
