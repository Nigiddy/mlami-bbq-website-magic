
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Orange curved background */}
      <div className={isMobile ? "hero-curve-mobile" : "hero-curve"}></div>
      
      <div className="container mx-auto grid md:grid-cols-2 gap-12 relative z-0">
        {/* Left side text content */}
        <div className="flex flex-col justify-center space-y-6 pt-12 md:pt-0">
          <h1 className="text-5xl md:text-6xl font-medium">
            <span className="font-dancing text-bbq-orange">Delicious</span> meals <br />
            made ready for <br />
            you!
          </h1>
          <p className="text-gray-600 max-w-md">
            Looking for something that will fill your appetite and make you looking for more? Well you've found it!
          </p>
          <div>
            <Link to="/menu">
              <Button className="bg-black hover:bg-bbq-orange text-white rounded-full px-8 py-6">
                Discover Menu
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Right side image content */}
        <div className="relative hidden md:block">
          {/* This part would have the food images arranged as in the design */}
          <img 
            src="/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png" 
            alt="Featured dishes" 
            className="absolute -right-24 top-1/2 transform -translate-y-1/2 max-w-none w-[600px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
