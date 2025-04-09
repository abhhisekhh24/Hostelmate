
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/components/ui/use-toast';
import { Utensils, Clock } from 'lucide-react';

// Mock data for meal time slots
const timeSlots = {
  breakfast: [
    { id: 'b1', time: '7:30 AM - 8:00 AM', available: true },
    { id: 'b2', time: '8:00 AM - 8:30 AM', available: true },
    { id: 'b3', time: '8:30 AM - 9:00 AM', available: true },
  ],
  lunch: [
    { id: 'l1', time: '12:30 PM - 1:00 PM', available: true },
    { id: 'l2', time: '1:00 PM - 1:30 PM', available: true },
    { id: 'l3', time: '1:30 PM - 2:00 PM', available: true },
  ],
  snacks: [
    { id: 's1', time: '4:30 PM - 5:00 PM', available: true },
    { id: 's2', time: '5:00 PM - 5:30 PM', available: true },
  ],
  dinner: [
    { id: 'd1', time: '7:30 PM - 8:00 PM', available: true },
    { id: 'd2', time: '8:00 PM - 8:30 PM', available: true },
    { id: 'd3', time: '8:30 PM - 9:00 PM', available: true },
  ],
};

const BookMeal = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeMeal, setActiveMeal] = useState('breakfast');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSlotSelect = (mealType: string, slotId: string) => {
    setSelectedSlots({
      ...selectedSlots,
      [mealType]: slotId,
    });
  };

  const handleBooking = () => {
    // In a real app, this would send the booking data to an API
    toast({
      title: "Booking Successful",
      description: "Your meal time slots have been booked successfully.",
    });
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Meal Time Slots</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>Choose a date to book your meals</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={(date) => {
                  const now = new Date();
                  const yesterday = new Date(now);
                  yesterday.setDate(now.getDate() - 1);
                  return date < yesterday;
                }}
              />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Selected: <span className="font-medium">{formatDate(date)}</span>
              </p>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Time Slots</CardTitle>
              <CardDescription>Book your preferred time slots for each meal</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeMeal} onValueChange={setActiveMeal}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="breakfast" className="flex items-center justify-center">
                    <span className="hidden md:inline mr-2">Breakfast</span>
                    <Utensils className="h-4 w-4 md:hidden" />
                  </TabsTrigger>
                  <TabsTrigger value="lunch" className="flex items-center justify-center">
                    <span className="hidden md:inline mr-2">Lunch</span>
                    <Utensils className="h-4 w-4 md:hidden" />
                  </TabsTrigger>
                  <TabsTrigger value="snacks" className="flex items-center justify-center">
                    <span className="hidden md:inline mr-2">Snacks</span>
                    <Utensils className="h-4 w-4 md:hidden" />
                  </TabsTrigger>
                  <TabsTrigger value="dinner" className="flex items-center justify-center">
                    <span className="hidden md:inline mr-2">Dinner</span>
                    <Utensils className="h-4 w-4 md:hidden" />
                  </TabsTrigger>
                </TabsList>
                
                {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal) => (
                  <TabsContent key={meal} value={meal} className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base">Select your preferred time slot</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          {timeSlots[meal].map((slot) => (
                            <div
                              key={slot.id}
                              className={`border rounded-md p-3 cursor-pointer transition-all ${
                                selectedSlots[meal] === slot.id
                                  ? 'border-mess-500 bg-mess-50'
                                  : 'border-gray-200 hover:border-mess-300'
                              }`}
                              onClick={() => handleSlotSelect(meal, slot.id)}
                            >
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-mess-600" />
                                <span className="text-sm">{slot.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleBooking}
                className="w-full bg-mess-600 hover:bg-mess-700"
              >
                Book Selected Slots
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookMeal;
