
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
  Building
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const UserManagement = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  
  // Sample user data
  const [users, setUsers] = useState([
    { id: 'user123', name: 'John Doe', email: 'john.doe@example.com', regNumber: 'BT20CSE123', roomNumber: 'A-101', phoneNumber: '9876543210', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    { id: 'user456', name: 'Jane Smith', email: 'jane.smith@example.com', regNumber: 'BT20ECE045', roomNumber: 'B-205', phoneNumber: '8765432109', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    { id: 'user789', name: 'Robert Brown', email: 'robert.brown@example.com', regNumber: 'BT20ME078', roomNumber: 'C-310', phoneNumber: '7654321098', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
    { id: 'user101', name: 'Lisa Wong', email: 'lisa.wong@example.com', regNumber: 'BT21CSE101', roomNumber: 'A-110', phoneNumber: '6543210987', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
    { id: 'user102', name: 'Michael Chen', email: 'michael.chen@example.com', regNumber: 'BT21ECE102', roomNumber: 'B-220', phoneNumber: '5432109876', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  ]);
  
  // Check if user is admin
  const isAdmin = user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter users based on search query and filter value
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterValue === 'all') return matchesSearch;
    if (filterValue === 'a-block') return matchesSearch && user.roomNumber.startsWith('A');
    if (filterValue === 'b-block') return matchesSearch && user.roomNumber.startsWith('B');
    if (filterValue === 'c-block') return matchesSearch && user.roomNumber.startsWith('C');
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" /> 
              Hostel Residents
            </CardTitle>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Input 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-full md:w-40">
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.regNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>{user.roomNumber}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="text-sm text-gray-500 mt-1">
                            📞 {user.phoneNumber}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No users found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} residents
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
