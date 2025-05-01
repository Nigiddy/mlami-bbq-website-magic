
import { useState } from 'react';
import { Menu, X, ChefHat } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import Cart from './Cart';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="py-4 relative z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="font-dancing text-3xl font-bold">Mlami BBQ</Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-8">
            <li><Link to="/" className="hover:text-bbq-orange transition-colors">Home</Link></li>
            <li><Link to="/menu" className="hover:text-bbq-orange transition-colors">Menu</Link></li>
            <li><Link to="/about" className="hover:text-bbq-orange transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-bbq-orange transition-colors">Contact</Link></li>
          </ul>
          <div className="flex items-center gap-4">
            <Cart />
            <Button asChild className="bg-black text-white rounded-full hover:bg-bbq-orange">
              <Link to="/reservation">Reserve Table</Link>
            </Button>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Cart />
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md py-4 md:hidden">
          <div className="container mx-auto px-4">
            <ul className="flex flex-col space-y-4">
              <li><Link to="/" onClick={() => setIsOpen(false)} className="block hover:text-bbq-orange transition-colors">Home</Link></li>
              <li><Link to="/menu" onClick={() => setIsOpen(false)} className="block hover:text-bbq-orange transition-colors">Menu</Link></li>
              <li><Link to="/about" onClick={() => setIsOpen(false)} className="block hover:text-bbq-orange transition-colors">About</Link></li>
              <li><Link to="/contact" onClick={() => setIsOpen(false)} className="block hover:text-bbq-orange transition-colors">Contact</Link></li>
              <li>
                <Link to="/reservation" onClick={() => setIsOpen(false)} className="inline-block w-full">
                  <Button className="bg-black text-white w-full rounded-full hover:bg-bbq-orange">
                    Reserve Table
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
