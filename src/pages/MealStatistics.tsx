import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, PieChart, RefreshCw } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MealStatistics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mealBookings, setMealBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentMonthName = format(now, 'MMMM yyyy');

  const COLORS = {
    breakfast: '#8884d8', 
    lunch: '#82ca9d', 
    snacks: '#ffc658', 
    dinner: '#ff8042',
    veg: '#82ca9d',
    nonveg: '#ff8042'
  };
  
  useEffect(() => {
    if (user) {
      fetchMealBookings();
    }
  }, [user]);
  
  const fetchMealBookings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('meal_bookings')
        .select('*')
        .eq('user_id', user?.id)
        .gte('booking_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('booking_date', format(monthEnd, 'yyyy-MM-dd'));
      
      if (error) throw error;
      
      setMealBookings(data || []);
    } catch (error) {
      console.error('Error fetching meal bookings:', error);
      toast({
        title: "Error loading meal statistics",
        description: "Could not load your meal booking data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getMealTypeChartData = () => {
    const mealCounts = {
      breakfast: 0,
      lunch: 0,
      snacks: 0,
      dinner: 0
    };
    
    mealBookings.forEach(booking => {
      if (booking.meal_type in mealCounts) {
        mealCounts[booking.meal_type.toLowerCase()]++;
      }
    });
    
    return Object.keys(mealCounts).map(meal => ({
      name: meal.charAt(0).toUpperCase() + meal.slice(1),
      value: mealCounts[meal],
      fill: COLORS[meal]
    }));
  };
  
  const getMealPreferenceData = () => {
    const prefCounts = {
      veg: 0,
      nonveg: 0
    };
    
    mealBookings.forEach(booking => {
      const pref = booking.meal_preference?.toLowerCase() === 'non-veg' ? 'nonveg' : 'veg';
      prefCounts[pref]++;
    });
    
    return [
      { name: 'Veg', value: prefCounts.veg, fill: COLORS.veg },
      { name: 'Non-Veg', value: prefCounts.nonveg, fill: COLORS.nonveg }
    ];
  };
  
  const getMealTypeByPreferenceData = () => {
    const data = [
      { name: 'Breakfast', veg: 0, nonveg: 0 },
      { name: 'Lunch', veg: 0, nonveg: 0 },
      { name: 'Snacks', veg: 0, nonveg: 0 },
      { name: 'Dinner', veg: 0, nonveg: 0 }
    ];
    
    mealBookings.forEach(booking => {
      const mealType = booking.meal_type.toLowerCase();
      const isVeg = booking.meal_preference?.toLowerCase() !== 'non-veg';
      
      const mealItem = data.find(item => item.name.toLowerCase() === mealType);
      if (mealItem) {
        if (isVeg) {
          mealItem.veg++;
        } else {
          mealItem.nonveg++;
        }
      }
    });
    
    return data;
  };
  
  const hasMealData = mealBookings.length > 0;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-md mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Meal Booking Statistics</CardTitle>
              <CardDescription>Your meal booking data for {currentMonthName}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchMealBookings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mess-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading your meal data...</p>
              </div>
            </div>
          ) : !hasMealData ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <PieChart className="h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-500">No Meal Data Available</h3>
              <p className="text-sm text-gray-400 max-w-md mt-1">
                You haven't booked any meals this month yet. Statistics will appear once you start booking meals.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">All Meals</TabsTrigger>
                <TabsTrigger value="preference">By Preference</TabsTrigger>
                <TabsTrigger value="combined">Combined View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <div className="h-96 w-full max-w-lg mx-auto">
                  <ChartContainer 
                    config={{
                      breakfast: { color: COLORS.breakfast },
                      lunch: { color: COLORS.lunch },
                      snacks: { color: COLORS.snacks },
                      dinner: { color: COLORS.dinner }
                    }}
                    className="w-full h-full"
                  >
                    <RechartsPieChart>
                      <Pie
                        data={getMealTypeChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getMealTypeChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </RechartsPieChart>
                  </ChartContainer>
                </div>
                <div className="text-center text-sm text-gray-500">
                  Distribution of meal types booked this month
                </div>
              </TabsContent>
              
              <TabsContent value="preference" className="space-y-4">
                <div className="h-96 w-full max-w-lg mx-auto">
                  <ChartContainer 
                    config={{
                      veg: { color: COLORS.veg },
                      nonveg: { color: COLORS.nonveg }
                    }}
                    className="w-full h-full"
                  >
                    <RechartsPieChart>
                      <Pie
                        data={getMealPreferenceData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getMealPreferenceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </RechartsPieChart>
                  </ChartContainer>
                </div>
                <div className="text-center text-sm text-gray-500">
                  Veg vs Non-Veg meals booked
                </div>
              </TabsContent>
              
              <TabsContent value="combined" className="space-y-4">
                <div className="h-96 w-full max-w-2xl mx-auto">
                  <ChartContainer 
                    config={{
                      veg: { color: COLORS.veg },
                      nonveg: { color: COLORS.nonveg }
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={getMealTypeByPreferenceData()}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                        <Bar dataKey="veg" name="Vegetarian" stackId="a" fill={COLORS.veg} />
                        <Bar dataKey="nonveg" name="Non-Vegetarian" stackId="a" fill={COLORS.nonveg} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="text-center text-sm text-gray-500">
                  Meal types by vegetarian preference
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MealStatistics;
