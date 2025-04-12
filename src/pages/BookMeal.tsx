import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/components/ui/use-toast';
import { Utensils, Clock, CheckCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
type BookingSlot = {
  id: string;
  meal_type: string;
  booking_date: string;
  time_slot: string;
  created_at: string;
};

// Mock data for meal time slots
const timeSlots = {
  breakfast: [{
    id: 'b1',
    time: '7:30 AM - 8:00 AM',
    available: true
  }, {
    id: 'b2',
    time: '8:00 AM - 8:30 AM',
    available: true
  }, {
    id: 'b3',
    time: '8:30 AM - 9:00 AM',
    available: true
  }],
  lunch: [{
    id: 'l1',
    time: '12:30 PM - 1:00 PM',
    available: true
  }, {
    id: 'l2',
    time: '1:00 PM - 1:30 PM',
    available: true
  }, {
    id: 'l3',
    time: '1:30 PM - 2:00 PM',
    available: true
  }],
  snacks: [{
    id: 's1',
    time: '4:30 PM - 5:00 PM',
    available: true
  }, {
    id: 's2',
    time: '5:00 PM - 5:30 PM',
    available: true
  }],
  dinner: [{
    id: 'd1',
    time: '7:30 PM - 8:00 PM',
    available: true
  }, {
    id: 'd2',
    time: '8:00 PM - 8:30 PM',
    available: true
  }, {
    id: 'd3',
    time: '8:30 PM - 9:00 PM',
    available: true
  }]
};
const BookMeal = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeMeal, setActiveMeal] = useState('breakfast');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);
  useEffect(() => {
    setDate(new Date());
  }, []);
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.from('meal_bookings').select('*').order('booking_date', {
        ascending: false
      });
      if (error) throw error;
      if (data) {
        setBookings(data as unknown as BookingSlot[]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error.message);
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSlotSelect = (mealType: string, slotId: string) => {
    setSelectedSlots({
      ...selectedSlots,
      [mealType]: slotId
    });
  };
  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book meal slots.",
        variant: "destructive"
      });
      return;
    }
    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a date for your booking.",
        variant: "destructive"
      });
      return;
    }
    const selectedMeals = Object.keys(selectedSlots);
    if (selectedMeals.length === 0) {
      toast({
        title: "No Slots Selected",
        description: "Please select at least one meal time slot.",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      const bookingsToInsert = selectedMeals.map(mealType => {
        const slotId = selectedSlots[mealType];
        const slotTimeObj = timeSlots[mealType as keyof typeof timeSlots].find(slot => slot.id === slotId);
        return {
          user_id: user.id,
          meal_type: mealType,
          booking_date: formattedDate,
          time_slot: slotTimeObj ? slotTimeObj.time : 'Unknown time slot'
        };
      });
      const {
        data,
        error
      } = await supabase.from('meal_bookings').insert(bookingsToInsert).select();
      if (error) throw error;
      toast({
        title: "Booking Successful",
        description: "Your meal time slots have been booked successfully."
      });
      fetchBookings();
      setSelectedSlots({});
    } catch (error: any) {
      console.error('Error booking slots:', error.message);
      toast({
        title: "Booking Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Meal Time Slots</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Today's Date</CardTitle>
              <CardDescription>Bookings only available for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-md border text-center bg-zinc-50">
                <p className="text-zinc-950 text-center text-2xl font-bold">
                  {date ? formatDate(date.toISOString()) : 'Loading...'}
                </p>
                <p className="mt-2 text-orange-950 text-xs">
                  Note: Meal slots can only be booked for today
                </p>
              </div>
            </CardContent>
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
                
                {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map(meal => <TabsContent key={meal} value={meal} className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base">Select your preferred time slot</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          {timeSlots[meal].map(slot => <div key={slot.id} className={`border rounded-md p-3 cursor-pointer transition-all ${selectedSlots[meal] === slot.id ? 'border-mess-500 bg-mess-50' : 'border-gray-200 hover:border-mess-300'}`} onClick={() => handleSlotSelect(meal, slot.id)}>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-mess-600" />
                                <span className="text-sm">{slot.time}</span>
                              </div>
                            </div>)}
                        </div>
                      </div>
                    </div>
                  </TabsContent>)}
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button onClick={handleBooking} className="w-full bg-mess-600 hover:bg-mess-700" disabled={isLoading}>
                {isLoading ? 'Booking...' : 'Book Selected Slots'}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Meal</TableHead>
                      <TableHead>Time Slot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map(booking => <TableRow key={booking.id}>
                        <TableCell>{formatDate(booking.booking_date)}</TableCell>
                        <TableCell className="capitalize">{booking.meal_type}</TableCell>
                        <TableCell>{booking.time_slot}</TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table> : <div className="text-center py-4 text-gray-500">
                  You haven't made any bookings yet.
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default BookMeal;