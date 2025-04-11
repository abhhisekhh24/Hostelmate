
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { 
  CalendarDays, 
  Plus, 
  Edit, 
  Trash2,
  Check,
  Eye
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';

const MenuSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  
  // Sample data for scheduled menus
  const [scheduledMenus, setScheduledMenus] = useState([
    { 
      id: 1, 
      date: format(new Date(), 'yyyy-MM-dd'), 
      meal: 'breakfast', 
      items: ['Bread', 'Eggs', 'Milk', 'Cereal', 'Fruits'],
      published: true
    },
    { 
      id: 2, 
      date: format(new Date(), 'yyyy-MM-dd'), 
      meal: 'lunch', 
      items: ['Rice', 'Dal', 'Paneer Curry', 'Salad', 'Yogurt'],
      published: true
    },
    { 
      id: 3, 
      date: format(new Date(), 'yyyy-MM-dd'), 
      meal: 'dinner', 
      items: ['Chapati', 'Mixed Vegetables', 'Chicken Curry', 'Rice', 'Ice Cream'],
      published: false
    },
    { 
      id: 4, 
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), 
      meal: 'breakfast', 
      items: ['Paratha', 'Curd', 'Fruits', 'Tea'],
      published: false
    },
  ]);
  
  // Check if user is admin
  const isAdmin = user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const getMealEmoji = (meal: string) => {
    switch (meal) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍛';
      case 'dinner': return '🍽️';
      case 'snacks': return '🍪';
      default: return '🍴';
    }
  };

  const handlePublish = (id: number) => {
    setScheduledMenus(prevMenus => 
      prevMenus.map(menu => 
        menu.id === id ? { ...menu, published: true } : menu
      )
    );
    
    toast({
      title: "Menu published",
      description: "The menu has been published and is now visible to users."
    });
  };

  const handleDelete = (id: number) => {
    setScheduledMenus(prevMenus => prevMenus.filter(menu => menu.id !== id));
    
    toast({
      title: "Menu deleted",
      description: "The menu has been deleted successfully."
    });
  };

  // Get menus for selected date
  const menusForSelectedDate = date 
    ? scheduledMenus.filter(menu => menu.date === format(date, 'yyyy-MM-dd'))
    : [];
  
  // Get menus for selected meal type across all dates
  const menusForSelectedMeal = scheduledMenus.filter(menu => menu.meal === selectedMeal);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Menu Schedule</h1>
        <Button className="bg-mess-600 hover:bg-mess-700">
          <Plus className="h-4 w-4 mr-2" /> Create New Menu
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2" /> 
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Menus for selected date */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {date ? `Menus for ${format(date, 'MMMM d, yyyy')}` : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {menusForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {menusForSelectedDate.map((menu) => (
                    <div key={menu.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium flex items-center">
                          {getMealEmoji(menu.meal)} {' '}
                          {menu.meal.charAt(0).toUpperCase() + menu.meal.slice(1)}
                        </h3>
                        <div className="flex space-x-2">
                          {!menu.published && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handlePublish(menu.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Publish
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(menu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <ul className="list-disc list-inside space-y-1">
                          {menu.items.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        Status: {' '}
                        {menu.published ? (
                          <span className="text-green-600">Published</span>
                        ) : (
                          <span className="text-yellow-600">Draft</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No menus scheduled for this date.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      // Add menu creation logic here
                      toast({
                        title: "Create Menu",
                        description: "Menu creation functionality would open here."
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create Menu for This Date
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Scheduled Menus</CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="meal-type" className="mr-2">Filter by meal:</Label>
                <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select meal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Meal</TableHead>
                      <TableHead>Menu Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menusForSelectedMeal.map((menu) => (
                      <TableRow key={menu.id}>
                        <TableCell>{menu.date}</TableCell>
                        <TableCell>
                          {getMealEmoji(menu.meal)} {' '}
                          {menu.meal.charAt(0).toUpperCase() + menu.meal.slice(1)}
                        </TableCell>
                        <TableCell>
                          <span className="truncate block max-w-xs">
                            {menu.items.join(', ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {menu.published ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Draft
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(menu.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              {/* Similar TabsContent for published and draft tabs */}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenuSchedule;
