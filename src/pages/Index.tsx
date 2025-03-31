
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PopularDishes from '@/components/PopularDishes';
import AboutUs from '@/components/AboutUs';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <PopularDishes />
      <AboutUs />
      <Footer />
    </div>
  );
};

export default Index;
