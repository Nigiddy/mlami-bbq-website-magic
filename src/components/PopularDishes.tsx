
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

type Dish = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  isPopular?: boolean;
  isNew?: boolean;
};

const dishes: Dish[] = [
  {
    id: 1,
    name: "Grilled Steak with Fries",
    description: "Made from Prime Beef",
    image: "/public/lovable-uploads/a9d863ba-60fc-44bc-a430-a3693f510471.png",
    price: "Ksh300",
    rating: 4,
    isPopular: true,
  },
  {
    id: 2,
    name: "Grilled Salad with Fries",
    description: "Made from Fresh Salad",
    image: "/public/lovable-uploads/a9d863ba-60fc-44bc-a430-a3693f510471.png",
    price: "N3,500",
    rating: 5,
    isNew: true,
  },
  {
    id: 3,
    name: "Grilled Steak with Fries",
    description: "Made from Salmon",
    image: "/public/lovable-uploads/a9d863ba-60fc-44bc-a430-a3693f510471.png",
    price: "N6,500",
    rating: 4,
  },
];

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
              {dishes.map((dish) => (
                <CarouselItem key={dish.id} className="md:basis-1/3">
                  <Card className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 -mt-12 relative">
                          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white transition-transform duration-300 hover:scale-105">
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                          </div>
                          {dish.isPopular && (
                            <Badge className="absolute -top-2 -right-2 bg-bbq-orange text-white border-white border-2">
                              Popular
                            </Badge>
                          )}
                          {dish.isNew && (
                            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white border-white border-2">
                              New
                            </Badge>
                          )}
                        </div>
                        <StarRating rating={dish.rating} />
                        <h3 className="text-gray-800 text-lg font-medium mt-2 mb-1">{dish.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{dish.description}</p>
                        <div className="flex justify-between items-center w-full mt-2">
                          <span className="text-gray-800 font-bold">{dish.price}</span>
                          <Button 
                            size="sm" 
                            className="rounded-full bg-bbq-orange hover:bg-bbq-orange/90 hover:scale-110 transition-all duration-200 h-8 w-8 p-0 active:scale-90"
                            title="Add to cart"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
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
