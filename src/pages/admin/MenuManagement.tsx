
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define the type for a menu item
type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  vegetarian: boolean;
};

const MenuManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Main Course');
  const [formDescription, setFormDescription] = useState('');
  const [formVegetarian, setFormVegetarian] = useState(false);
  
  // Updated admin check to use both the explicit isAdmin property and the email check for backward compatibility
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch menu items
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      return data as MenuItem[];
    }
  });

  // Add menu item mutation
  const addMenuItem = useMutation({
    mutationFn: async (newItem: Omit<MenuItem, 'id'>) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([newItem])
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Menu item added",
        description: "The item has been added to the menu successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update menu item mutation
  const updateMenuItem = useMutation({
    mutationFn: async (item: MenuItem) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          name: item.name,
          category: item.category,
          description: item.description,
          vegetarian: item.vegetarian
        })
        .eq('id', item.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      resetForm();
      setIsEditDialogOpen(false);
      toast({
        title: "Menu item updated",
        description: "The item has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete menu item mutation
  const deleteMenuItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({
        title: "Menu item deleted",
        description: "The item has been removed successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddItem = () => {
    if (!formName.trim()) {
      toast({
        title: "Validation error",
        description: "Item name is required",
        variant: "destructive"
      });
      return;
    }

    addMenuItem.mutate({
      name: formName,
      category: formCategory,
      description: formDescription || null,
      vegetarian: formVegetarian
    });
  };

  const handleUpdateItem = () => {
    if (!selectedItem) return;
    if (!formName.trim()) {
      toast({
        title: "Validation error",
        description: "Item name is required",
        variant: "destructive"
      });
      return;
    }

    updateMenuItem.mutate({
      id: selectedItem.id,
      name: formName,
      category: formCategory,
      description: formDescription || null,
      vegetarian: formVegetarian
    });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMenuItem.mutate(id);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description || '');
    setFormVegetarian(item.vegetarian);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('Main Course');
    setFormDescription('');
    setFormVegetarian(false);
    setSelectedItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Menu Management</h1>
        <Button 
          className="bg-mess-600 hover:bg-mess-700"
          onClick={openAddDialog}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Food Items</CardTitle>
            <div className="relative w-64">
              <Input 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="vegetarian">Vegetarian</TabsTrigger>
              <TabsTrigger value="non-vegetarian">Non-Vegetarian</TabsTrigger>
              <TabsTrigger value="main">Main Course</TabsTrigger>
              <TabsTrigger value="side">Side Dish</TabsTrigger>
              <TabsTrigger value="dessert">Dessert</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-mess-600" />
                </div>
              ) : filteredItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.vegetarian 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {item.vegetarian ? 'Veg' : 'Non-Veg'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items found. Try adjusting your search or add new items.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="vegetarian">
              <p className="text-muted-foreground">Filter shows vegetarian items only</p>
            </TabsContent>
            
            <TabsContent value="non-vegetarian">
              <p className="text-muted-foreground">Filter shows non-vegetarian items only</p>
            </TabsContent>
            
            <TabsContent value="main">
              <p className="text-muted-foreground">Filter shows main course items only</p>
            </TabsContent>
            
            <TabsContent value="side">
              <p className="text-muted-foreground">Filter shows side dish items only</p>
            </TabsContent>
            
            <TabsContent value="dessert">
              <p className="text-muted-foreground">Filter shows dessert items only</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Add details for the new food item to be added to the menu.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="Main Course">Main Course</option>
                <option value="Side Dish">Side Dish</option>
                <option value="Dessert">Dessert</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the item"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="vegetarian"
                checked={formVegetarian}
                onCheckedChange={setFormVegetarian}
              />
              <Label htmlFor="vegetarian">Vegetarian</Label>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAddItem}
              disabled={addMenuItem.isPending}
              className="bg-mess-600 hover:bg-mess-700"
            >
              {addMenuItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details for this food item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Item Name</Label>
              <Input 
                id="edit-name" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <select 
                id="edit-category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="Main Course">Main Course</option>
                <option value="Side Dish">Side Dish</option>
                <option value="Dessert">Dessert</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the item"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-vegetarian"
                checked={formVegetarian}
                onCheckedChange={setFormVegetarian}
              />
              <Label htmlFor="edit-vegetarian">Vegetarian</Label>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateItem}
              disabled={updateMenuItem.isPending}
              className="bg-mess-600 hover:bg-mess-700"
            >
              {updateMenuItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
