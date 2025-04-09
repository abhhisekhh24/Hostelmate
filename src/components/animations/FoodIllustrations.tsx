
import React from 'react';
import { Pizza, Coffee, Apple, IceCream, EggFried, Sandwich } from 'lucide-react';

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
      size: 32, 
      animationDelay: "0s"
    },
    { 
      icon: <Coffee />, 
      className: "text-brown-400 dark:text-amber-600 top-[70%] left-[15%]", 
      size: 28, 
      animationDelay: "0.5s"
    },
    { 
      icon: <Apple />, 
      className: "text-red-500 dark:text-red-400 top-[20%] right-[8%]", 
      size: 24, 
      animationDelay: "1s"
    },
    { 
      icon: <IceCream />, 
      className: "text-pink-300 dark:text-pink-200 top-[65%] right-[12%]", 
      size: 30, 
      animationDelay: "1.5s"
    },
    { 
      icon: <EggFried />, 
      className: "text-yellow-400 dark:text-yellow-300 top-[40%] left-[5%]", 
      size: 26, 
      animationDelay: "2s"
    },
    { 
      icon: <Sandwich />, 
      className: "text-amber-500 dark:text-amber-400 top-[35%] right-[5%]", 
      size: 28, 
      animationDelay: "2.5s"
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {foodItems.map((food, index) => (
        <div 
          key={index}
          className={`absolute ${food.className} animate-float opacity-50 dark:opacity-30`}
          style={{ 
            animationDelay: food.animationDelay,
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
