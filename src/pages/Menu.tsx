
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Plus } from 'lucide-react';

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Smoked Brisket",
    description: "Slow-smoked for 12 hours, our signature brisket melts in your mouth",
    price: "1899",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    category: "BBQ Specialties"
  },
  {
    id: 2,
    name: "Pulled Pork Sandwich",
    description: "Hand-pulled pork shoulder with our signature BBQ sauce",
    price: "1499",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    category: "BBQ Specialties"
  },
  {
    id: 3,
    name: "BBQ Ribs",
    description: "Fall-off-the-bone tender ribs with our signature dry rub",
    price: "2299",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    category: "BBQ Specialties"
  },
  {
    id: 4,
    name: "Grilled Chicken",
    description: "Juicy grilled chicken with herbs and spices",
    price: "1699",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    category: "BBQ Specialties"
  },
  {
    id: 5,
    name: "BBQ Chicken Wings",
    description: "Crispy wings tossed in our signature BBQ sauce",
    price: "1299",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    category: "Starters"
  },
  {
    id: 6,
    name: "Loaded Fries",
    description: "Crispy fries topped with cheese, bacon, and scallions",
    price: "899",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    category: "Sides"
  },
];

const Menu = () => {
  const { addItem } = useCart();

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-bbq-pale-orange py-16">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-4">
              <span className="font-dancing text-bbq-orange">Our</span> Menu
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our delicious BBQ dishes made with love and the finest ingredients.
              From smoked meats to tasty sides, we have something for everyone.
            </p>
          </div>
        </div>
        
        <div className="py-16 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.image} 
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
                      className="rounded-full bg-black hover:bg-bbq-orange text-white h-10 w-10 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Add to cart"
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Menu;
