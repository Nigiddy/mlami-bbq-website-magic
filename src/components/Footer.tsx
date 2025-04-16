
import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Info */}
          <div>
            <Link to="/" className="font-dancing text-2xl font-bold mb-4 inline-block">Mlami BBQ</Link>
            <p className="text-gray-600 text-sm mb-4">
              Delicious and authentic BBQ meals made with love and tradition.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-bbq-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-bbq-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-bbq-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-bbq-orange" />
                <p className="text-gray-600 text-sm">123 BBQ Street, Flavor City, FC 12345</p>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-bbq-orange" />
                <p className="text-gray-600 text-sm">(123) 456-7890</p>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-bbq-orange" />
                <p className="text-gray-600 text-sm">info@mlamibbq.com</p>
              </div>
            </div>
          </div>
          
          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-medium mb-4">Open Hours</h3>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Monday - Friday: 9:00 AM - 10:00 PM</p>
              <p className="text-gray-600 text-sm">Saturday - Sunday: 10:00 AM - 9:00 PM</p>
            </div>
            <div className="mt-4">
              <Link to="/reservation" className="w-full sm:w-auto inline-block">
                <Button className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-bbq-orange transition-colors w-full sm:w-auto">
                  Reserve Table
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-gray-600 text-sm text-center">
            © {new Date().getFullYear()} Mlami BBQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
