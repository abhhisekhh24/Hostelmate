
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/components/ui/use-toast';
import { Utensils, Clock, CheckCircle, Leaf, Drumstick, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

type BookingSlot = {
  id: string;
  meal_type: string;
  booking_date: string;
  time_slot: string;
  created_at: string;
  meal_preference?: 'veg' | 'non-veg';
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
  const [mealPreferences, setMealPreferences] = useState<Record<string, 'veg' | 'non-veg'>>({
    breakfast: 'veg',
    lunch: 'veg',
    snacks: 'veg',
    dinner: 'veg'
  });
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userBookedMeals, setUserBookedMeals] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    if (user && date) {
      checkExistingBookings();
    }
  }, [user, date]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('meal_bookings')
        .select('*')
        .order('booking_date', { ascending: false });
      
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

  const checkExistingBookings = async () => {
    if (!user || !date) return;
    
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meal_bookings')
        .select('meal_type')
        .eq('user_id', user.id)
        .eq('booking_date', formattedDate);
      
      if (error) throw error;
      
      if (data) {
        const bookedMealTypes = data.map(booking => booking.meal_type);
        setUserBookedMeals(bookedMealTypes);
        
        // Clear selections for already booked meal types
        const updatedSelectedSlots = { ...selectedSlots };
        bookedMealTypes.forEach(mealType => {
          if (updatedSelectedSlots[mealType]) {
            delete updatedSelectedSlots[mealType];
          }
        });
        setSelectedSlots(updatedSelectedSlots);
      }
    } catch (error: any) {
      console.error('Error checking existing bookings:', error.message);
    }
  };

  const handleSlotSelect = (mealType: string, slotId: string) => {
    if (userBookedMeals.includes(mealType)) {
      toast({
        title: "Already Booked",
        description: `You have already booked a ${mealType} slot for today.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedSlots({
      ...selectedSlots,
      [mealType]: slotId
    });
  };

  const handleMealPreferenceChange = (mealType: string, preference: 'veg' | 'non-veg') => {
    setMealPreferences({
      ...mealPreferences,
      [mealType]: preference
    });
  };

  const handleBooking = async () => {
    setBookingError('');
    
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

    // Check for already booked meal types
    const alreadyBookedMeals = selectedMeals.filter(mealType => 
      userBookedMeals.includes(mealType)
    );

    if (alreadyBookedMeals.length > 0) {
      setBookingError(`You have already booked ${alreadyBookedMeals.join(', ')} for today.`);
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
          time_slot: slotTimeObj ? slotTimeObj.time : 'Unknown time slot',
          meal_preference: mealPreferences[mealType] || 'veg'
        };
      });

      const { data, error } = await supabase
        .from('meal_bookings')
        .insert(bookingsToInsert)
        .select();

      if (error) throw error;

      toast({
        title: "Booking Successful",
        description: "Your meal time slots have been booked successfully."
      });

      // Update the user's booked meals
      await fetchBookings();
      await checkExistingBookings();
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

  const isMealTypeBooked = (mealType: string) => {
    return userBookedMeals.includes(mealType);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">Book Meal Time Slots</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Today's Date</CardTitle>
              <CardDescription className="text-center">Bookings only available for today</CardDescription>
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
              {bookingError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{bookingError}</AlertDescription>
                </Alert>
              )}
              
              <Tabs value={activeMeal} onValueChange={setActiveMeal}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="breakfast" className="flex items-center justify-center" disabled={isMealTypeBooked('breakfast')}>
                    <span className="hidden md:inline mr-2">Breakfast</span>
                    <Utensils className="h-4 w-4 md:hidden" />
                    {isMealTypeBooked('breakfast') && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="lunch" className="flex items-center justify-center" disabled={isMealTypeBooked('lunch')}>
                    <span className="hidden md:inline mr-2">Lunch</span>
                    <Utensils className="h-4 w-4 md:hidden" />
                    {isMealTypeBooked('lunch') && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="snacks" className="flex items-center justify-center" disabled={isMealTypeBooked('snacks')}>
                    <span className="hidden md:inline mr-2">Snacks</span>
                    <Utensils className="h-4 w-4 md:hidden" />
                    {isMealTypeBooked('snacks') && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="dinner" className="flex items-center justify-center" disabled={isMealTypeBooked('dinner')}>
                    <span className="hidden md:inline mr-2">Dinner</span>
                    <Utensils className="h-4 w-4 md:hidden" />
                    {isMealTypeBooked('dinner') && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
                  </TabsTrigger>
                </TabsList>
                
                {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map(meal => (
                  <TabsContent key={meal} value={meal} className="pt-4">
                    {isMealTypeBooked(meal) ? (
                      <div className="p-4 rounded-md bg-gray-100 text-center">
                        <p className="text-gray-600 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                          You have already booked a {meal} slot for today
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <Label className="text-base mb-2 block">Select your preferred time slot</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            {timeSlots[meal].map(slot => (
                              <div 
                                key={slot.id} 
                                className={`border rounded-md p-3 cursor-pointer transition-all ${
                                  selectedSlots[meal] === slot.id ? 'border-mess-500 bg-mess-50' : 'border-gray-200 hover:border-mess-300'
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
                        
                        <div className="border-t pt-4">
                          <Label className="text-base mb-3 block">Meal Preference</Label>
                          
                          <RadioGroup 
                            value={mealPreferences[meal]} 
                            onValueChange={(val) => handleMealPreferenceChange(meal, val as 'veg' | 'non-veg')}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="veg" id={`${meal}-veg`} />
                              <Label htmlFor={`${meal}-veg`} className="flex items-center">
                                <Leaf className="h-4 w-4 mr-2 text-green-600" />
                                Veg
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="non-veg" id={`${meal}-non-veg`} />
                              <Label htmlFor={`${meal}-non-veg`} className="flex items-center">
                                <Drumstick className="h-4 w-4 mr-2 text-red-600" />
                                Non-Veg
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
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
              {bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Meal</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Preference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map(booking => (
                      <TableRow key={booking.id}>
                        <TableCell>{formatDate(booking.booking_date)}</TableCell>
                        <TableCell className="capitalize">{booking.meal_type}</TableCell>
                        <TableCell>{booking.time_slot}</TableCell>
                        <TableCell>
                          {booking.meal_preference === 'veg' ? (
                            <div className="flex items-center">
                              <Leaf className="h-4 w-4 mr-1 text-green-600" />
                              <span>Veg</span>
                            </div>
                          ) : booking.meal_preference === 'non-veg' ? (
                            <div className="flex items-center">
                              <Drumstick className="h-4 w-4 mr-1 text-red-600" />
                              <span>Non-Veg</span>
                            </div>
                          ) : (
                            <span>Not specified</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  You haven't made any bookings yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookMeal;
