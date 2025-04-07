
import { LayoutDashboard, ClipboardList, Package, QrCode } from 'lucide-react';

interface AdminSidebarProps {
  activeView: 'dashboard' | 'orders' | 'inventory' | 'qrcodes';
  setActiveView: (view: 'dashboard' | 'orders' | 'inventory' | 'qrcodes') => void;
}

const AdminSidebar = ({ activeView, setActiveView }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
  ];

  return (
    <div className="w-full md:w-64 backdrop-blur-md bg-white/60 rounded-xl p-4 shadow-lg border border-white/20 h-max">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-bbq-orange">Admin Portal</h2>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-bbq-orange text-white'
                    : 'hover:bg-white/80'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
