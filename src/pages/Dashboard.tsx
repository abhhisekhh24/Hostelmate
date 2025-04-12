import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Utensils, MessageSquare, Clock } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
const Dashboard = () => {
  const {
    user
  } = useAuth();
  const currentDate = new Date();

  // State to check if it's today or not
  const [isToday, setIsToday] = useState(true);

  // Effect to check if the date is today
  useEffect(() => {
    const checkIfToday = () => {
      const today = new Date();
      return format(today, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
    };
    setIsToday(checkIfToday());

    // Set up an interval to check if it's midnight
    const intervalId = setInterval(() => {
      const now = new Date();
      // If it's midnight (00:00), update isToday
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setIsToday(checkIfToday());
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [currentDate]);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // For a realistic app, these would come from an API
  const todaysMeals = [{
    name: 'Breakfast',
    time: '7:30 AM - 9:00 AM',
    menu: 'Bread, Eggs, Cereal, Milk, Fruits'
  }, {
    name: 'Lunch',
    time: '12:30 PM - 2:00 PM',
    menu: 'Rice, Dal, Paneer Curry, Salad, Yogurt'
  }, {
    name: 'Snacks',
    time: '4:30 PM - 5:30 PM',
    menu: 'Samosa, Tea/Coffee'
  }, {
    name: 'Dinner',
    time: '7:30 PM - 9:00 PM',
    menu: 'Chapati, Mixed Vegetables, Chicken Curry, Rice, Ice Cream'
  }];
  return <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-mess-400">Hello, {user?.name}</h1>
        <p className="text-gray-600 mt-1">{formatDate(currentDate)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/menu" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Weekly Menu</CardTitle>
              <CalendarDays className="h-5 w-5 text-mess-600" />
            </CardHeader>
            <CardContent>
              <CardDescription>View this week's mess menu</CardDescription>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/book-meal" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Book Meal</CardTitle>
              <Utensils className="h-5 w-5 text-mess-600" />
            </CardHeader>
            <CardContent>
              <CardDescription>Book your meal time slots</CardDescription>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/feedback" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Feedback</CardTitle>
              <MessageSquare className="h-5 w-5 text-mess-600" />
            </CardHeader>
            <CardContent>
              <CardDescription>Share your feedback on meals</CardDescription>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/complaints" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Complaints</CardTitle>
              <MessageSquare className="h-5 w-5 text-mess-600" />
            </CardHeader>
            <CardContent>
              <CardDescription>Report issues or problems</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-mess-400">Today's Meals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {todaysMeals.map((meal, index) => <Card key={index} className="bg-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-gray-950">{meal.name}</CardTitle>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {meal.time}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{meal.menu}</p>
                <div className="mt-4 flex justify-between items-center">
                  {isToday ? <Link to="/book-meal">
                      <span className="text-sm text-mess-600 hover:text-mess-700 font-medium">Book slot</span>
                    </Link> : <span className="text-sm text-gray-400 cursor-not-allowed">
                      Booking opens at midnight
                    </span>}
                  <Link to="/feedback">
                    <span className="text-sm text-mess-600 hover:text-mess-700 font-medium">Give feedback</span>
                  </Link>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </div>;
};
export default Dashboard;