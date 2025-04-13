
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Users, 
  Eye,
  Mail,
  Building,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  reg_number: string;
  room_number: string;
  phone_number?: string;
  avatar?: string;
};

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch users from Supabase
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Get users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      // For demonstration, get email from a mock function (in a real app, you'd have this in your data)
      return data.map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown',
        email: `${profile.reg_number?.toLowerCase() || 'user'}@example.com`, // Mock email
        reg_number: profile.reg_number || 'Not Set',
        room_number: profile.room_number || 'Not Set',
        phone_number: profile.phone_number,
        avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`
      })) as User[];
    }
  });

  // Filter users based on search query and filter value
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.reg_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.room_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterValue === 'all') return matchesSearch;
    if (filterValue === 'a-block') return matchesSearch && user.room_number.startsWith('A');
    if (filterValue === 'b-block') return matchesSearch && user.room_number.startsWith('B');
    if (filterValue === 'c-block') return matchesSearch && user.room_number.startsWith('C');
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
      </div>
      
      <Card className="border dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <Users className="h-5 w-5 mr-2" /> 
              Hostel Residents
            </CardTitle>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full dark:bg-gray-800 dark:border-gray-700"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-full md:w-40 dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="a-block">A Block</SelectItem>
                  <SelectItem value="b-block">B Block</SelectItem>
                  <SelectItem value="c-block">C Block</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mess-600" />
            </div>
          ) : (
            <div className="rounded-md border dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Name</TableHead>
                    <TableHead className="dark:text-gray-300">Registration Number</TableHead>
                    <TableHead className="dark:text-gray-300">Room</TableHead>
                    <TableHead className="dark:text-gray-300">Contact</TableHead>
                    <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="dark:border-gray-700">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium dark:text-gray-300">{user.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">{user.reg_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center space-x-1 dark:border-gray-700 dark:text-gray-300">
                            <Building className="h-3 w-3" />
                            <span>{user.room_number}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm dark:text-gray-300">{user.email}</span>
                          </div>
                          {user.phone_number && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              📞 {user.phone_number}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="dark:text-gray-300">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No users found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredUsers.length} of {users.length} residents
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
