
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
  Eye,
  Loader2
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { format, addDays, parseISO, isEqual } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery as useReactQuery } from "@tanstack/react-query";

// Define types
type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  vegetarian: boolean;
};

type ScheduledMenu = {
  id: string;
  date: string;
  meal_type: string;
  items: string[];
  published: boolean;
  created_at: string;
};

const MenuSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Form state
  const [formMealType, setFormMealType] = useState('breakfast');
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formPublished, setFormPublished] = useState(false);
  const [formItems, setFormItems] = useState<string[]>([]);
  const [formNewItem, setFormNewItem] = useState('');
  const [selectedMenu, setSelectedMenu] = useState<ScheduledMenu | null>(null);
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch all menu items
  const { data: menuItems = [], isLoading: isMenuItemsLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data as MenuItem[];
    }
  });

  // Fetch scheduled menus
  const { data: scheduledMenus = [], isLoading: isScheduledMenusLoading } = useQuery({
    queryKey: ['scheduledMenus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_menus')
        .select('*')
        .order('date');
      
      if (error) throw error;
      
      // Convert JSON items field to array if needed
      return data.map(menu => ({
        ...menu,
        items: Array.isArray(menu.items) ? menu.items : menu.items[menu.meal_type] || []
      })) as ScheduledMenu[];
    }
  });

  // Add scheduled menu mutation
  const addScheduledMenu = useMutation({
    mutationFn: async (newMenu: Omit<ScheduledMenu, 'id' | 'created_at'>) => {
      // Format the items as a JSON object with meal type as key
      const itemsJson = {
        [newMenu.meal_type]: newMenu.items
      };
      
      const { data, error } = await supabase
        .from('scheduled_menus')
        .insert([{
          date: format(newMenu.date, 'yyyy-MM-dd'),
          meal_type: newMenu.meal_type,
          items: itemsJson,
          published: newMenu.published
        }])
        .select();
      
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMenus'] });
      setIsAddMenuOpen(false);
      resetForm();
      toast({
        title: "Menu scheduled",
        description: "The menu has been scheduled successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error scheduling menu",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update scheduled menu mutation
  const updateScheduledMenu = useMutation({
    mutationFn: async (menu: ScheduledMenu) => {
      // Format the items as a JSON object with meal type as key
      const itemsJson = {
        [menu.meal_type]: menu.items
      };
      
      const { data, error } = await supabase
        .from('scheduled_menus')
        .update({
          date: format(parseISO(menu.date), 'yyyy-MM-dd'),
          meal_type: menu.meal_type,
          items: itemsJson,
          published: menu.published
        })
        .eq('id', menu.id)
        .select();
      
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMenus'] });
      setIsEditMenuOpen(false);
      resetForm();
      toast({
        title: "Menu updated",
        description: "The menu has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating menu",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete scheduled menu mutation
  const deleteScheduledMenu = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_menus')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMenus'] });
      toast({
        title: "Menu deleted",
        description: "The menu has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting menu",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Publish scheduled menu mutation
  const publishScheduledMenu = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('scheduled_menus')
        .update({ published: true })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMenus'] });
      toast({
        title: "Menu published",
        description: "The menu has been published and is now visible to users."
      });
    },
    onError: (error) => {
      toast({
        title: "Error publishing menu",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddItem = () => {
    if (formNewItem.trim()) {
      setFormItems([...formItems, formNewItem.trim()]);
      setFormNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleSubmitMenu = () => {
    if (formItems.length === 0) {
      toast({
        title: "Validation error",
        description: "Please add at least one item to the menu",
        variant: "destructive"
      });
      return;
    }

    addScheduledMenu.mutate({
      date: formDate,
      meal_type: formMealType,
      items: formItems,
      published: formPublished
    });
  };

  const handleUpdateMenu = () => {
    if (!selectedMenu) return;
    if (formItems.length === 0) {
      toast({
        title: "Validation error",
        description: "Please add at least one item to the menu",
        variant: "destructive"
      });
      return;
    }

    updateScheduledMenu.mutate({
      ...selectedMenu,
      date: format(formDate, 'yyyy-MM-dd'),
      meal_type: formMealType,
      items: formItems,
      published: formPublished
    });
  };

  const handleDeleteMenu = (id: string) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      deleteScheduledMenu.mutate(id);
    }
  };

  const handlePublishMenu = (id: string) => {
    publishScheduledMenu.mutate(id);
  };

  const handleEditMenu = (menu: ScheduledMenu) => {
    setSelectedMenu(menu);
    setFormMealType(menu.meal_type);
    setFormDate(parseISO(menu.date));
    setFormItems(menu.items);
    setFormPublished(menu.published);
    setIsEditMenuOpen(true);
  };

  const resetForm = () => {
    setFormMealType('breakfast');
    setFormDate(new Date());
    setFormItems([]);
    setFormNewItem('');
    setFormPublished(false);
    setSelectedMenu(null);
  };

  const openAddMenuDialog = () => {
    resetForm();
    if (date) {
      setFormDate(date);
    }
    setIsAddMenuOpen(true);
  };

  const openAddMenuForSelectedDate = () => {
    resetForm();
    if (date) {
      setFormDate(date);
    }
    setIsAddMenuOpen(true);
  };

  const getMealEmoji = (meal: string) => {
    switch (meal) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍛';
      case 'dinner': return '🍽️';
      case 'snacks': return '🍪';
      default: return '🍴';
    }
  };

  // Get menus for selected date
  const menusForSelectedDate = date 
    ? scheduledMenus.filter(menu => {
        const menuDate = parseISO(menu.date);
        return isEqual(
          new Date(menuDate.getFullYear(), menuDate.getMonth(), menuDate.getDate()),
          new Date(date.getFullYear(), date.getMonth(), date.getDate())
        );
      })
    : [];
  
  // Get menus for selected meal type across all dates
  const menusForSelectedMeal = scheduledMenus.filter(menu => menu.meal_type === selectedMeal);

  // Determine if data is loading
  const isLoading = isMenuItemsLoading || isScheduledMenusLoading;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Menu Schedule</h1>
        <Button 
          className="bg-mess-600 hover:bg-mess-700"
          onClick={openAddMenuDialog}
        >
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-mess-600" />
                </div>
              ) : menusForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {menusForSelectedDate.map((menu) => (
                    <div key={menu.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium flex items-center">
                          {getMealEmoji(menu.meal_type)} {' '}
                          {menu.meal_type.charAt(0).toUpperCase() + menu.meal_type.slice(1)}
                        </h3>
                        <div className="flex space-x-2">
                          {!menu.published && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handlePublishMenu(menu.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Publish
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditMenu(menu)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteMenu(menu.id)}
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
                    onClick={openAddMenuForSelectedDate}
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
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-mess-600" />
                  </div>
                ) : (
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
                      {menusForSelectedMeal
                        .filter(menu => {
                          if (activeTab === 'upcoming') return true;
                          if (activeTab === 'published') return menu.published;
                          if (activeTab === 'draft') return !menu.published;
                          return true;
                        })
                        .map((menu) => (
                          <TableRow key={menu.id}>
                            <TableCell>{format(parseISO(menu.date), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>
                              {getMealEmoji(menu.meal_type)} {' '}
                              {menu.meal_type.charAt(0).toUpperCase() + menu.meal_type.slice(1)}
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
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleEditMenu(menu)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteMenu(menu.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Menu Dialog */}
      <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule a New Menu</DialogTitle>
            <DialogDescription>
              Create a menu for a specific date and meal type. Published menus will be visible to users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select value={formMealType} onValueChange={setFormMealType}>
                  <SelectTrigger id="meal-type">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={formDate}
                  onSelect={(date) => date && setFormDate(date)}
                  className="border rounded-md"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formPublished}
                  onCheckedChange={setFormPublished}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menu-items">Menu Items</Label>
                <div className="flex space-x-2">
                  <Input
                    id="menu-items"
                    placeholder="Add menu item"
                    value={formNewItem}
                    onChange={(e) => setFormNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddItem}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md min-h-[200px]">
                  {formItems.length > 0 ? (
                    <ul className="space-y-2">
                      {formItems.map((item, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>{item}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No items added yet. Add some items to create the menu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSubmitMenu}
              disabled={addScheduledMenu.isPending || formItems.length === 0}
              className="bg-mess-600 hover:bg-mess-700"
            >
              {addScheduledMenu.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Dialog */}
      <Dialog open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
            <DialogDescription>
              Update this menu details and items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-meal-type">Meal Type</Label>
                <Select value={formMealType} onValueChange={setFormMealType}>
                  <SelectTrigger id="edit-meal-type">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={formDate}
                  onSelect={(date) => date && setFormDate(date)}
                  className="border rounded-md"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-published"
                  checked={formPublished}
                  onCheckedChange={setFormPublished}
                />
                <Label htmlFor="edit-published">Published</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-menu-items">Menu Items</Label>
                <div className="flex space-x-2">
                  <Input
                    id="edit-menu-items"
                    placeholder="Add menu item"
                    value={formNewItem}
                    onChange={(e) => setFormNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddItem}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md min-h-[200px]">
                  {formItems.length > 0 ? (
                    <ul className="space-y-2">
                      {formItems.map((item, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>{item}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No items added yet. Add some items to the menu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateMenu}
              disabled={updateScheduledMenu.isPending || formItems.length === 0}
              className="bg-mess-600 hover:bg-mess-700"
            >
              {updateScheduledMenu.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuSchedule;
