import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

type MenuItem = {
  id: string;
  name: string;
};

const MenuSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [menuItems, setMenuItems] = useState({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleAddItem = (mealType: string, item: string) => {
    setMenuItems(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], item]
    }));
  };
  
  const handleRemoveItem = (mealType: string, index: number) => {
    setMenuItems(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };
  
  // Fix the type error by converting date to string format
  const handlePublish = async () => {
    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for this menu",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsPublishing(true);
      
      // Convert date to ISO format string for Supabase
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('scheduled_menus')
        .insert({
          date: formattedDate, // Now using a string instead of Date object
          meal_type: selectedMealType,
          items: menuItems,
          published: true
        });
        
      if (error) throw error;
      
      toast({
        title: "Menu Published",
        description: `Menu for ${formattedDate} has been published successfully.`
      });
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedMealType('');
      setMenuItems({
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: []
      });
      
    } catch (error: any) {
      console.error("Error publishing menu:", error.message);
      toast({
        title: "Error",
        description: `Failed to publish menu: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Menu Schedule</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Schedule Menu</CardTitle>
          <CardDescription>Plan and publish the weekly menu</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Select Date</Label>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            
            <div>
              <Label htmlFor="mealType">Select Meal Type</Label>
              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger id="mealType">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedMealType && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Add Menu Items for {selectedMealType}</h3>
              
              <div className="space-y-2">
                <Label htmlFor={`newItem-${selectedMealType}`}>New Item</Label>
                <div className="flex space-x-2">
                  <Input 
                    id={`newItem-${selectedMealType}`}
                    placeholder="Enter menu item"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleAddItem(selectedMealType, e.target.value);
                        (e.target as HTMLInputElement).value = ''; // Clear the input
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    onClick={(e) => {
                      const input = document.getElementById(`newItem-${selectedMealType}`) as HTMLInputElement;
                      if (input && input.value) {
                        handleAddItem(selectedMealType, input.value);
                        input.value = ''; // Clear the input
                      }
                    }}
                  >
                    Add Item
                  </Button>
                </div>
              </div>
              
              {menuItems[selectedMealType].length > 0 && (
                <div>
                  <h4 className="text-lg font-medium">Current Items</h4>
                  <ul className="list-disc pl-5">
                    {menuItems[selectedMealType].map((item, index) => (
                      <li key={index} className="flex items-center justify-between py-1">
                        <span>{item}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveItem(selectedMealType, index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <div className="p-6 flex justify-end">
          <Button 
            className="bg-mess-600 hover:bg-mess-700"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish Menu
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MenuSchedule;
