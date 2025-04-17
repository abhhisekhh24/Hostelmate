
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { User, Pencil, Save, BarChart, PieChart } from 'lucide-react';
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

const Profile = () => {
  const {
    user,
    updateProfile
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  // Meal statistics state
  const [mealBookings, setMealBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current month date range
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentMonthName = format(now, 'MMMM yyyy');

  // Avatar options
  const avatarOptions = ["https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", "https://api.dicebear.com/7.x/avataaars/svg?seed=Dusty", "https://api.dicebear.com/7.x/avataaars/svg?seed=Missy", "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", "https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey", "https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper"];
  
  // Colors for charts
  const COLORS = {
    breakfast: '#8884d8', 
    lunch: '#82ca9d', 
    snacks: '#ffc658', 
    dinner: '#ff8042',
    veg: '#82ca9d',
    nonveg: '#ff8042'
  };
  
  // Fetch meal bookings data
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
  
  // Process data for meal type chart
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
  
  // Process data for preference chart
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
      { name: 'Vegetarian', value: prefCounts.veg, fill: COLORS.veg },
      { name: 'Non-Vegetarian', value: prefCounts.nonveg, fill: COLORS.nonveg }
    ];
  };
  
  // Process data for meal type by preference
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
  
  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleSaveClick = () => {
    updateProfile({
      name,
      phoneNumber,
      avatar
    });
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully."
    });
    setIsEditing(false);
  };
  
  const handleAvatarSelect = (avatarUrl: string) => {
    setAvatar(avatarUrl);
  };
  
  const hasMealData = mealBookings.length > 0;
  
  return <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">My Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatar || ''} alt={user.name} />
                <AvatarFallback className="text-lg bg-mess-600 text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && <div className="grid grid-cols-3 gap-2 w-full pt-2">
                  {avatarOptions.map((avatarUrl, index) => <button key={index} className={`p-1 rounded-lg ${avatar === avatarUrl ? 'ring-2 ring-mess-600' : 'hover:bg-gray-100'}`} onClick={() => handleAvatarSelect(avatarUrl)}>
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={avatarUrl} alt={`Avatar option ${index + 1}`} />
                        <AvatarFallback className="bg-mess-300">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </button>)}
                </div>}
              
              <div className="text-center">
                <h4 className="font-medium text-lg">{user.name}</h4>
                <p className="text-muted-foreground">{user.regNumber}</p>
              </div>
              
              {!isEditing ? <Button variant="outline" className="w-full" onClick={handleEditClick}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button> : <Button className="w-full bg-mess-600 hover:bg-mess-700" onClick={handleSaveClick}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>View and update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? <Input id="name" value={name} onChange={e => setName(e.target.value)} /> : <div className="p-2 border rounded-md bg-gray-50">{user.name}</div>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="p-2 border rounded-md bg-gray-50">{user.email}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <div className="p-2 border rounded-md bg-gray-50">{user.regNumber}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <div className="p-2 border rounded-md bg-gray-50">{user.roomNumber}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                {isEditing ? <Input id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter phone number" /> : <div className="p-2 border rounded-md bg-gray-50">
                    {user.phoneNumber || 'Not provided'}
                  </div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Meal Statistics Section */}
      <div className="mt-8">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Meal Booking Statistics</CardTitle>
                <CardDescription>View your meal booking data for {currentMonthName}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchMealBookings}>
                <BarChart className="h-4 w-4 mr-2" />
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
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Meals</TabsTrigger>
                  <TabsTrigger value="preference">By Preference</TabsTrigger>
                  <TabsTrigger value="combined">Combined View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <div className="h-80">
                    <ChartContainer 
                      config={{
                        breakfast: { color: COLORS.breakfast },
                        lunch: { color: COLORS.lunch },
                        snacks: { color: COLORS.snacks },
                        dinner: { color: COLORS.dinner }
                      }}
                    >
                      <RechartsPieChart>
                        <Pie
                          data={getMealTypeChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {getMealTypeChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </RechartsPieChart>
                    </ChartContainer>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    Distribution of meal types booked this month
                  </div>
                </TabsContent>
                
                <TabsContent value="preference" className="space-y-4">
                  <div className="h-80">
                    <ChartContainer 
                      config={{
                        veg: { color: COLORS.veg },
                        nonveg: { color: COLORS.nonveg }
                      }}
                    >
                      <RechartsPieChart>
                        <Pie
                          data={getMealPreferenceData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {getMealPreferenceData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </RechartsPieChart>
                    </ChartContainer>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    Vegetarian vs Non-Vegetarian meals booked
                  </div>
                </TabsContent>
                
                <TabsContent value="combined" className="space-y-4">
                  <div className="h-80">
                    <ChartContainer 
                      config={{
                        veg: { color: COLORS.veg },
                        nonveg: { color: COLORS.nonveg }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={getMealTypeByPreferenceData()}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
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
    </div>;
};
export default Profile;
