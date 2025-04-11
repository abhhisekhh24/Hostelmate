
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock,
  Eye,
  Calendar,
  Search,
  Loader2
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
  created_by: string;
  expires_at: string | null;
  is_active: boolean;
};

const Announcements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [expiryDate, setExpiryDate] = useState('');
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as Announcement[];
    }
  });

  // Add announcement mutation
  const addAnnouncement = useMutation({
    mutationFn: async (newAnnouncement: Omit<Announcement, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert([newAnnouncement])
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      resetForm();
      toast({
        title: "Announcement created",
        description: "Your announcement has been published successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating announcement",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete announcement mutation
  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting announcement",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPriority('normal');
    setExpiryDate('');
    setShowForm(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create announcements.",
        variant: "destructive"
      });
      return;
    }
    
    const newAnnouncement = {
      title,
      content,
      priority,
      created_by: user.id,
      expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
      is_active: true
    };
    
    addAnnouncement.mutate(newAnnouncement);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncement.mutate(id);
    }
  };

  const getTypeIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500">Urgent</Badge>;
      case 'important':
        return <Badge className="bg-amber-500">Important</Badge>;
      case 'normal':
      default:
        return <Badge className="bg-blue-500">Normal</Badge>;
    }
  };

  const getStatusBadge = (announcement: Announcement) => {
    const now = new Date();
    const expiryDate = announcement.expires_at ? new Date(announcement.expires_at) : null;
    
    if (!announcement.is_active) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200">
        <Clock className="h-3 w-3 mr-1" /> Inactive
      </Badge>;
    } else if (expiryDate && expiryDate < now) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200">
        <Clock className="h-3 w-3 mr-1" /> Expired
      </Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" /> Active
      </Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');
  };

  // Filter announcements based on search query and status filter
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const now = new Date();
    const expiryDate = announcement.expires_at ? new Date(announcement.expires_at) : null;
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && announcement.is_active && (!expiryDate || expiryDate >= now);
    if (filterStatus === 'expired') return matchesSearch && (expiryDate && expiryDate < now);
    if (filterStatus === 'inactive') return matchesSearch && !announcement.is_active;
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Announcements</h1>
        <Button 
          className="bg-mess-600 hover:bg-mess-700"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>Cancel</>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> New Announcement
            </>
          )}
        </Button>
      </div>
      
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">Title</label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="priority" className="block text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="expiryDate" className="block text-sm font-medium">Expiry Date (Optional)</label>
                <Input 
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium">Content</label>
                <Textarea 
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter announcement content"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-mess-600 hover:bg-mess-700"
                  disabled={addAnnouncement.isPending}
                >
                  {addAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publish Announcement
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" /> 
              All Announcements
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Input 
                  placeholder="Search announcements..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-mess-600" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell className="font-medium">{announcement.title}</TableCell>
                        <TableCell>{getTypeIcon(announcement.priority)}</TableCell>
                        <TableCell>{formatDate(announcement.created_at)}</TableCell>
                        <TableCell>{formatDate(announcement.expires_at)}</TableCell>
                        <TableCell>{getStatusBadge(announcement)}</TableCell>
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
                              onClick={() => handleDelete(announcement.id)}
                              disabled={deleteAnnouncement.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No announcements found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Announcements;
