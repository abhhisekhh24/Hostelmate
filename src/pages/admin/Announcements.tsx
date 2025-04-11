
import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';

const Announcements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcementType, setAnnouncementType] = useState('general');
  
  // Sample announcements data
  const [announcements, setAnnouncements] = useState([
    { 
      id: 1, 
      title: 'Menu Changes for Next Week', 
      content: 'Due to supply constraints, the mess menu will be slightly modified next week. Please check the updated menu.', 
      type: 'menu',
      date: '2025-04-10',
      status: 'active' 
    },
    { 
      id: 2, 
      title: 'Mess Timing Change for Festival', 
      content: 'Please note that mess timings will be adjusted during the upcoming festival days. Breakfast: 8-9:30 AM, Lunch: 1-2:30 PM, Dinner: 8-10 PM', 
      type: 'timing',
      date: '2025-04-09',
      status: 'scheduled' 
    },
    { 
      id: 3, 
      title: 'Special Dinner on Saturday', 
      content: 'We are pleased to announce a special dinner on Saturday to celebrate the end of semester. The menu includes various delicacies and desserts.', 
      type: 'event',
      date: '2025-04-08',
      status: 'active' 
    },
    { 
      id: 4, 
      title: 'Feedback Session', 
      content: 'We will be conducting a feedback session on Friday at 5 PM in the common room. Please join us to share your thoughts on improving mess services.', 
      type: 'general',
      date: '2025-04-07',
      status: 'expired' 
    },
    { 
      id: 5, 
      title: 'Maintenance Notice', 
      content: 'The kitchen will undergo maintenance on Sunday morning. Breakfast will be served as packed meals.', 
      type: 'general',
      date: '2025-04-06',
      status: 'expired' 
    },
  ]);
  
  // Check if user is admin
  const isAdmin = user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'menu':
        return <Badge className="bg-blue-500">Menu</Badge>;
      case 'timing':
        return <Badge className="bg-purple-500">Timing</Badge>;
      case 'event':
        return <Badge className="bg-green-500">Event</Badge>;
      case 'general':
      default:
        return <Badge className="bg-gray-500">General</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Active
        </Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200">
          <Calendar className="h-3 w-3 mr-1" /> Scheduled
        </Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200">
          <Clock className="h-3 w-3 mr-1" /> Expired
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add new announcement
    const newAnnouncement = {
      id: Date.now(),
      title,
      content,
      type: announcementType,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'active'
    };
    
    setAnnouncements([newAnnouncement, ...announcements]);
    
    // Reset form and hide it
    setTitle('');
    setContent('');
    setAnnouncementType('general');
    setShowForm(false);
    
    toast({
      title: "Announcement created",
      description: "Your announcement has been published successfully."
    });
  };

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
    
    toast({
      title: "Announcement deleted",
      description: "The announcement has been deleted successfully."
    });
  };

  // Filter announcements based on search query and status filter
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && announcement.status === filterStatus;
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
                <label htmlFor="type" className="block text-sm font-medium">Type</label>
                <Select value={announcementType} onValueChange={setAnnouncementType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="menu">Menu</SelectItem>
                    <SelectItem value="timing">Timing</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
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
                >
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>{getTypeIcon(announcement.type)}</TableCell>
                      <TableCell>{announcement.date}</TableCell>
                      <TableCell>{getStatusBadge(announcement.status)}</TableCell>
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No announcements found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Announcements;
