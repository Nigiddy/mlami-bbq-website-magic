
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="py-16 bg-gray-100 relative">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4">
        {/* Image */}
        <div className="rounded-lg overflow-hidden">
          <img 
            src="/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png" 
            alt="About Mlami BBQ" 
            className="w-full h-[400px] object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-medium">
            <span className="font-dancing text-bbq-orange">About</span> Us
          </h2>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed 
            do eiusmod tempor incididunt ut labore et dolo laboris nisi 
            ut aliquip ex ea commodo consequat.
          </p>
          <div>
            <Link to="/about" className="w-full sm:w-auto inline-block">
              <Button className="bg-black hover:bg-bbq-orange text-white rounded-full px-6 py-2 md:px-8 w-full sm:w-auto">
                Learn more
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
