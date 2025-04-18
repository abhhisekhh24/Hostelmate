import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Circle, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input"
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

const BookMeal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mealType, setMealType] = useState<string>('');
  const [mealPreference, setMealPreference] = useState<string>('veg');
  const [bookingNote, setBookingNote] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'PPP') : 'Select a date';
  };

  const handleBooking = async () => {
    if (!date || !mealType) {
      toast({
        title: "Missing Information",
        description: "Please select a date and meal type.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const { data, error } = await supabase
        .from('meal_bookings')
        .insert([
          {
            user_id: user?.id,
            booking_date: format(date, 'yyyy-MM-dd'),
            meal_type: mealType,
            meal_preference: mealPreference,
            booking_note: bookingNote,
          },
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Booking Successful",
        description: `Your ${mealType} on ${formatDate(date)} has been booked.`,
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error booking meal:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book meal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Book Your Meal</CardTitle>
          <CardDescription>Select your meal preferences and book your slot.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="date">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {formatDate(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="meal-type">Meal Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              <button
                onClick={() => setMealType('Breakfast')}
                className={cn(
                  "flex items-center justify-center rounded-md border border-muted px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
                  mealType === 'Breakfast' ? 'bg-secondary text-secondary-foreground' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                )}
                data-state={mealType === 'Breakfast' ? 'active' : 'inactive'}
              >
                {mealType === 'Breakfast' && <CheckCircle2 className="w-4 h-4 mr-1" />}
                Breakfast
              </button>
              <button
                onClick={() => setMealType('Lunch')}
                className={cn(
                  "flex items-center justify-center rounded-md border border-muted px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
                  mealType === 'Lunch' ? 'bg-secondary text-secondary-foreground' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                )}
                data-state={mealType === 'Lunch' ? 'active' : 'inactive'}
              >
                {mealType === 'Lunch' && <CheckCircle2 className="w-4 h-4 mr-1" />}
                Lunch
              </button>
              <button
                onClick={() => setMealType('Snacks')}
                className={cn(
                  "flex items-center justify-center rounded-md border border-muted px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
                  mealType === 'Snacks' ? 'bg-secondary text-secondary-foreground' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                )}
                data-state={mealType === 'Snacks' ? 'active' : 'inactive'}
              >
                {mealType === 'Snacks' && <CheckCircle2 className="w-4 h-4 mr-1" />}
                Snacks
              </button>
              <button
                onClick={() => setMealType('Dinner')}
                className={cn(
                  "flex items-center justify-center rounded-md border border-muted px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
                  mealType === 'Dinner' ? 'bg-secondary text-secondary-foreground' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                )}
                data-state={mealType === 'Dinner' ? 'active' : 'inactive'}
              >
                {mealType === 'Dinner' && <CheckCircle2 className="w-4 h-4 mr-1" />}
                Dinner
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="meal-preference">Meal Preference</Label>
            {/* In the meal preference selection */}
            <RadioGroup defaultValue="veg" onValueChange={setMealPreference}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="veg" id="veg" />
                <Label htmlFor="veg">Veg</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-veg" id="non-veg" />
                <Label htmlFor="non-veg">Non-Veg</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="note">Booking Note (Optional)</Label>
            <Input
              type="text"
              id="note"
              placeholder="Add a note for your booking (e.g., allergies)"
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
            />
          </div>

          <Button onClick={handleBooking} disabled={isBooking}>
            {isBooking ? (
              <>
                <Utensils className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Utensils className="mr-2 h-4 w-4" />
                Book Meal
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookMeal;
