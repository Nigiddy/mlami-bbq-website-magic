
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Skeleton } from '@/components/ui/skeleton';

const Menu = () => {
  const { addItem } = useCart();
  const location = useLocation();
  const { toast } = useToast();
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const { menuItems, isLoading, error } = useMenuItems();

  useEffect(() => {
    // Parse table number from URL query parameters
    const params = new URLSearchParams(location.search);
    const table = params.get('table');
    
    if (table) {
      setTableNumber(table);
      toast({
        title: "Table Detected",
        description: `You are ordering from Table #${table}`,
      });
    }
  }, [location.search, toast]);

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price.toString(),
      image: item.image_url || "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png", // Fallback image
      tableNumber: tableNumber,
      inStock: item.in_stock
    });
  };

  // Group items by category
  const categorizedItems = menuItems.reduce<Record<string, any[]>>((acc, item) => {
    if (!acc[item.category_id]) {
      acc[item.category_id] = [];
    }
    acc[item.category_id].push(item);
    return acc;
  }, {});

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-red-600">Error Loading Menu</h2>
            <p className="mt-2">Please try again later</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-bbq-pale-orange py-16">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-4">
              <span className="font-dancing text-bbq-orange">Our</span> Menu
              {tableNumber && <span className="ml-2 text-2xl font-normal">(Table #{tableNumber})</span>}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our delicious BBQ dishes made with love and the finest ingredients.
              From smoked meats to tasty sides, we have something for everyone.
            </p>
          </div>
        </div>
        
        <div className="py-16 container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex justify-end">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={item.image_url || "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png"} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-medium">{item.name}</h3>
                      <span className="text-bbq-orange font-medium">Ksh {item.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex justify-end">
                      <Button 
                        size="sm"
                        disabled={!item.in_stock}
                        className={`rounded-full ${item.in_stock ? 'bg-black hover:bg-bbq-orange' : 'bg-gray-300'} text-white h-10 w-10 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110`}
                        title={item.in_stock ? "Add to cart" : "Out of stock"}
                        onClick={() => item.in_stock && handleAddToCart(item)}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Menu;
