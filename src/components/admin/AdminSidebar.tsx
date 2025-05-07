
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, Package, QrCode, Users, ChefHat } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

type AdminViewType = 'dashboard' | 'orders' | 'inventory' | 'qrcodes' | 'users' | 'cook';

interface AdminSidebarProps {
  activeView: AdminViewType;
  setActiveView: (view: AdminViewType) => void;
}

const AdminSidebar = ({ activeView, setActiveView }: AdminSidebarProps) => {
  const { isAdmin, isCook } = useAuth();
  
  // Define navigation items with role-based visibility
  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      value: 'dashboard' as AdminViewType,
      visibleTo: ['admin', 'cook'] // Both admin and cook can see dashboard
    },
    {
      title: 'Orders',
      icon: <ShoppingBag className="h-5 w-5" />,
      value: 'orders' as AdminViewType,
      visibleTo: ['admin', 'cook'] // Both can see orders
    },
    {
      title: 'Inventory',
      icon: <Package className="h-5 w-5" />,
      value: 'inventory' as AdminViewType,
      visibleTo: ['admin', 'cook'] // Both can manage inventory
    },
    {
      title: 'QR Codes',
      icon: <QrCode className="h-5 w-5" />,
      value: 'qrcodes' as AdminViewType,
      visibleTo: ['admin'] // Admin only
    },
    {
      title: 'User Management',
      icon: <Users className="h-5 w-5" />,
      value: 'users' as AdminViewType,
      visibleTo: ['admin'] // Admin only
    },
    {
      title: 'Cook Dashboard',
      icon: <ChefHat className="h-5 w-5" />,
      value: 'cook' as AdminViewType,
      visibleTo: ['cook', 'admin'] // Cook and admin can see cook dashboard
    }
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (isAdmin) return item.visibleTo.includes('admin');
    if (isCook) return item.visibleTo.includes('cook');
    return false;
  });

  return (
    <div className="w-full md:w-64 space-y-2">
      {filteredNavItems.map((item) => (
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
