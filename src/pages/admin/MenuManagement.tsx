import React, { useState } from 'react';
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
  Search 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const MenuManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock data for menu items
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Rice', category: 'Main Course', description: 'Steamed white rice', vegetarian: true },
    { id: 2, name: 'Chicken Curry', category: 'Main Course', description: 'Spicy chicken curry', vegetarian: false },
    { id: 3, name: 'Mixed Vegetables', category: 'Side Dish', description: 'Seasonal vegetables', vegetarian: true },
    { id: 4, name: 'Dal', category: 'Side Dish', description: 'Lentil soup', vegetarian: true },
    { id: 5, name: 'Curd', category: 'Dessert', description: 'Plain yogurt', vegetarian: true },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Updated admin check to use both the explicit isAdmin property and the email check for backward compatibility
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDeleteItem = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast({
      title: "Menu item deleted",
      description: "The menu item has been removed successfully."
    });
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Menu Management</h1>
        <Button className="bg-mess-600 hover:bg-mess-700">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
    </div>
  );
};

export default MenuManagement;
