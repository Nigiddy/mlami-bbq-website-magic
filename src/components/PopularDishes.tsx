
import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Star, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from './ui/carousel';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

type Dish = {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  in_stock: boolean;
  category_id: number;
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
};

const PopularDishes = () => {
  const { addItem } = useCart();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        setIsLoading(true);
        
        // Fetch a limited number of dishes - in a real app, you might have a popularity field
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .limit(6);
          
        if (error) throw error;
        
        setDishes(data || []);
      } catch (err) {
        console.error('Error fetching popular dishes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularDishes();
  }, []);

  const handleAddToCart = (dish: Dish) => {
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price.toString(),
      image: dish.image_url || "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
      inStock: dish.in_stock
    });
  };

  return (
    <div className="py-16 bg-white text-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium mb-4">
            <span className="font-dancing text-bbq-orange">Our Featured</span> Dishes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our culinary creations come to life.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent>
              {isLoading ? (
                // Skeleton loading state
                Array(3).fill(0).map((_, index) => (
                  <CarouselItem key={index} className="md:basis-1/3">
                    <Card className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <div className="mb-4 -mt-12 relative">
                            <Skeleton className="w-28 h-28 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-20 mb-2" />
                          <Skeleton className="h-5 w-36 mb-1" />
                          <Skeleton className="h-4 w-24 mb-3" />
                          <div className="flex justify-between items-center w-full mt-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))
              ) : (
                dishes.map((dish) => (
                  <CarouselItem key={dish.id} className="md:basis-1/3">
                    <Card className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <div className="mb-4 -mt-12 relative">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white transition-transform duration-300 hover:scale-105">
                              <img 
                                src={dish.image_url || "/public/lovable-uploads/a9d863ba-60fc-44bc-a430-a3693f510471.png"} 
                                alt={dish.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          </div>
                          <StarRating rating={Math.floor(Math.random() * 2) + 4} /> {/* Random rating between 4-5 */}
                          <h3 className="text-gray-800 text-lg font-medium mt-2 mb-1">{dish.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{dish.description}</p>
                          <div className="flex justify-between items-center w-full mt-2">
                            <span className="text-gray-800 font-bold">Ksh {dish.price}</span>
                            <Button 
                              size="sm" 
                              disabled={!dish.in_stock}
                              className={`rounded-full ${dish.in_stock ? 'bg-bbq-orange hover:bg-bbq-orange/90' : 'bg-gray-300'} text-white h-8 w-8 p-0 hover:scale-110 transition-all duration-200 active:scale-90`}
                              title={dish.in_stock ? "Add to cart" : "Out of stock"}
                              onClick={() => dish.in_stock && handleAddToCart(dish)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="left-0 bg-bbq-orange border-0 text-white hover:bg-bbq-orange/90 hidden data-[state=hidden]:hidden data-[state=visible]:inline-flex" />
            <CarouselNext className="right-0 bg-bbq-orange border-0 text-white hover:bg-bbq-orange/90 hidden data-[state=hidden]:hidden data-[state=visible]:inline-flex" />
          </Carousel>
        </div>

        <div className="mt-10 text-center">
          <Button className="bg-bbq-orange hover:bg-bbq-orange/90 hover:scale-105 transition-all duration-200 text-white px-8 rounded-full">
            View more
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
