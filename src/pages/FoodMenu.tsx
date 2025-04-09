
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for the weekly menu
const weeklyMenu = {
  monday: {
    breakfast: 'Idli, Vada, Sambar, Coconut Chutney, Coffee/Tea',
    lunch: 'Rice, Dal, Aloo Gobi, Chapati, Curd, Pickle',
    snacks: 'Biscuits, Coffee/Tea',
    dinner: 'Chapati, Paneer Butter Masala, Jeera Rice, Salad'
  },
  tuesday: {
    breakfast: 'Poha, Boiled Eggs, Bread, Jam, Coffee/Tea',
    lunch: 'Rice, Rajma, Mixed Vegetable, Chapati, Raita',
    snacks: 'Samosa, Coffee/Tea',
    dinner: 'Chapati, Chicken Curry, Rice, Salad, Ice Cream'
  },
  wednesday: {
    breakfast: 'Dosa, Coconut Chutney, Upma, Coffee/Tea',
    lunch: 'Rice, Dal Makhani, Bhindi Fry, Chapati, Curd',
    snacks: 'Vada Pav, Coffee/Tea',
    dinner: 'Chapati, Egg Curry, Veg Pulao, Raita'
  },
  thursday: {
    breakfast: 'Paratha, Curd, Fruits, Coffee/Tea',
    lunch: 'Rice, Kadhi, Aloo Matar, Chapati, Pickle',
    snacks: 'Kachori, Coffee/Tea',
    dinner: 'Chapati, Dal Tadka, Veg Biryani, Salad'
  },
  friday: {
    breakfast: 'Bread Omelette, Cornflakes, Milk, Coffee/Tea',
    lunch: 'Rice, Chole, Aloo Jeera, Chapati, Raita',
    snacks: 'Pav Bhaji, Coffee/Tea',
    dinner: 'Chapati, Mix Veg Curry, Fried Rice, Gulab Jamun'
  },
  saturday: {
    breakfast: 'Puri, Bhaji, Sprouts, Coffee/Tea',
    lunch: 'Rice, Dal Fry, Gobi Matar, Chapati, Curd',
    snacks: 'Bread Pakora, Coffee/Tea',
    dinner: 'Chapati, Fish Curry, Jeera Rice, Salad'
  },
  sunday: {
    breakfast: 'Chole Bhature, Fruits, Coffee/Tea',
    lunch: 'Rice, Sambar, Rasam, Chapati, Papad, Sweet',
    snacks: 'French Fries, Coffee/Tea',
    dinner: 'Chapati, Mutton/Paneer Curry, Pulao, Raita, Ice Cream'
  }
};

// Helper to determine the current day
const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = new Date().getDay();
  return days[currentDayIndex];
};

const FoodMenu = () => {
  const [activeDay, setActiveDay] = useState(getCurrentDay());

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Weekly Food Menu</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full">
          <div className="px-4 overflow-x-auto">
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger 
                value="monday" 
                className={`py-2 ${activeDay === 'monday' ? 'bg-mess-600 text-white' : ''}`}
              >
                Monday
              </TabsTrigger>
              <TabsTrigger 
                value="tuesday"
                className={`py-2 ${activeDay === 'tuesday' ? 'bg-mess-600 text-white' : ''}`}
              >
                Tuesday
              </TabsTrigger>
              <TabsTrigger 
                value="wednesday"
                className={`py-2 ${activeDay === 'wednesday' ? 'bg-mess-600 text-white' : ''}`}
              >
                Wednesday
              </TabsTrigger>
              <TabsTrigger 
                value="thursday"
                className={`py-2 ${activeDay === 'thursday' ? 'bg-mess-600 text-white' : ''}`}
              >
                Thursday
              </TabsTrigger>
              <TabsTrigger 
                value="friday"
                className={`py-2 ${activeDay === 'friday' ? 'bg-mess-600 text-white' : ''}`}
              >
                Friday
              </TabsTrigger>
              <TabsTrigger 
                value="saturday"
                className={`py-2 ${activeDay === 'saturday' ? 'bg-mess-600 text-white' : ''}`}
              >
                Saturday
              </TabsTrigger>
              <TabsTrigger 
                value="sunday"
                className={`py-2 ${activeDay === 'sunday' ? 'bg-mess-600 text-white' : ''}`}
              >
                Sunday
              </TabsTrigger>
            </TabsList>
          </div>
          
          {Object.keys(weeklyMenu).map((day) => (
            <TabsContent key={day} value={day} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-mess-100">
                    <CardTitle className="text-mess-700">Breakfast</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p>{weeklyMenu[day as keyof typeof weeklyMenu].breakfast}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-mess-100">
                    <CardTitle className="text-mess-700">Lunch</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p>{weeklyMenu[day as keyof typeof weeklyMenu].lunch}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-mess-100">
                    <CardTitle className="text-mess-700">Snacks</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p>{weeklyMenu[day as keyof typeof weeklyMenu].snacks}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-mess-100">
                    <CardTitle className="text-mess-700">Dinner</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p>{weeklyMenu[day as keyof typeof weeklyMenu].dinner}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default FoodMenu;
