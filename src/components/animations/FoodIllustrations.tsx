
import React from 'react';
import { Pizza, Coffee, Apple, IceCream, EggFried, Sandwich, Cake, Banana, Cherry, Croissant, Beef } from 'lucide-react';

interface FoodItem {
  icon: React.ReactNode;
  className: string;
  size: number;
  animationDelay: string;
}

const FoodIllustrations: React.FC = () => {
  const foodItems: FoodItem[] = [
    { 
      icon: <Pizza />, 
      className: "text-red-400 dark:text-red-300 top-[15%] left-[10%]", 
      size: 42, 
      animationDelay: "0s"
    },
    { 
      icon: <Coffee />, 
      className: "text-amber-700 dark:text-amber-600 top-[70%] left-[15%]", 
      size: 38, 
      animationDelay: "0.5s"
    },
    { 
      icon: <Apple />, 
      className: "text-red-500 dark:text-red-400 top-[20%] right-[8%]", 
      size: 34, 
      animationDelay: "1s"
    },
    { 
      icon: <IceCream />, 
      className: "text-pink-300 dark:text-pink-200 top-[65%] right-[12%]", 
      size: 40, 
      animationDelay: "1.5s"
    },
    { 
      icon: <EggFried />, 
      className: "text-yellow-400 dark:text-yellow-300 top-[40%] left-[5%]", 
      size: 36, 
      animationDelay: "2s"
    },
    { 
      icon: <Sandwich />, 
      className: "text-amber-500 dark:text-amber-400 top-[35%] right-[5%]", 
      size: 38, 
      animationDelay: "2.5s"
    },
    { 
      icon: <Cake />, 
      className: "text-purple-400 dark:text-purple-300 top-[25%] left-[25%]", 
      size: 40, 
      animationDelay: "3s"
    },
    { 
      icon: <Banana />, 
      className: "text-yellow-300 dark:text-yellow-200 top-[55%] right-[25%]", 
      size: 36, 
      animationDelay: "3.5s"
    },
    { 
      icon: <Cherry />, 
      className: "text-red-600 dark:text-red-500 top-[10%] right-[30%]", 
      size: 32, 
      animationDelay: "4s"
    },
    { 
      icon: <Croissant />, 
      className: "text-yellow-600 dark:text-yellow-500 top-[75%] left-[35%]", 
      size: 38, 
      animationDelay: "4.5s"
    },
    { 
      icon: <Beef />, 
      className: "text-red-700 dark:text-red-600 top-[45%] right-[40%]", 
      size: 40, 
      animationDelay: "5s"
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {foodItems.map((food, index) => (
        <div 
          key={index}
          className={`absolute ${food.className} animate-float opacity-50 dark:opacity-30`}
          style={{ 
            animation: `float 10s ease-in-out infinite, rotate 20s linear infinite`,
            animationDelay: food.animationDelay,
            fontSize: `${food.size}px`
          }}
        >
          {food.icon}
        </div>
      ))}
    </div>
  );
};

export default FoodIllustrations;
