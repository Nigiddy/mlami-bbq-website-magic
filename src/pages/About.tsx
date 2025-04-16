
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-bbq-pale-orange py-16">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-5xl font-medium mb-4">
              <span className="font-dancing text-bbq-orange">About</span> Us
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn more about Mlami BBQ - our story, our passion, and our commitment to serving 
              the most delicious BBQ meals in town.
            </p>
          </div>
        </div>
        
        <div className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img 
                src="/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png" 
                alt="Our Story" 
                className="rounded-lg w-full h-[400px] object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-medium mb-6">
                <span className="font-dancing text-bbq-orange">Our</span> Story
              </h2>
              <p className="text-gray-600 mb-4">
                Mlami BBQ was founded in 2010 by Chef James Miller, who had a passion for authentic 
                barbecue and wanted to share his family recipes with the world. What started as a 
                small food truck has now grown into one of the most beloved BBQ restaurants in the city.
              </p>
              <p className="text-gray-600">
                We take pride in using only the finest ingredients, slow-cooking our meats to perfection, 
                and creating a warm, welcoming atmosphere for all our guests. Our commitment to quality 
                and flavor has earned us numerous awards and a loyal customer base.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-medium mb-6">
                <span className="font-dancing text-bbq-orange">Our</span> Food Philosophy
              </h2>
              <p className="text-gray-600 mb-4">
                At Mlami BBQ, we believe that great barbecue takes time, patience, and passion. 
                We slow-smoke our meats for up to 16 hours to achieve that perfect tenderness and 
                smoky flavor that our customers have come to love.
              </p>
              <p className="text-gray-600">
                We source our ingredients locally whenever possible, supporting local farmers and 
                ensuring the freshest flavors. Our sauces and rubs are made in-house using 
                secret family recipes that have been passed down through generations.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png" 
                alt="Our Food Philosophy" 
                className="rounded-lg w-full h-[400px] object-cover"
              />
            </div>
          </div>
          
          <div className="text-center py-8">
            <h2 className="text-3xl font-medium mb-6">
              <span className="font-dancing text-bbq-orange">Come</span> Visit Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              We'd love to have you dine with us and experience the Mlami BBQ difference. 
              Reserve a table today or stop by for a meal you won't forget!
            </p>
            <Link to="/reservation" className="inline-block w-full sm:w-auto">
              <Button className="bg-black hover:bg-bbq-orange text-white rounded-full px-6 py-2 md:px-8 w-full sm:w-auto">
                Reserve Table
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
