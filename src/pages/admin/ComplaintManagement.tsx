
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Textarea  
} from "@/components/ui/index";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  Filter
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Complaint = {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    name?: string;
    reg_number?: string;
    room_number?: string;
  };
};

const ComplaintManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState('');
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch complaints with user details
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles:user_id (
            name, 
            reg_number,
            room_number
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Map the nested profile data to the user property
      return data.map((complaint: any) => ({
        ...complaint,
        user: complaint.profiles
      })) as Complaint[];
    }
  });

  // Update complaint status mutation
  const updateComplaintStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({
        title: "Status Updated",
        description: "Complaint status has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = (complaintId: string, newStatus: string) => {
    updateComplaintStatus.mutate({ id: complaintId, status: newStatus });
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'food-quality':
        return 'Food Quality';
      case 'service':
        return 'Service';
      case 'cleanliness':
        return 'Cleanliness';
      case 'timing':
        return 'Timing Issues';
      case 'facilities':
        return 'Facilities';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPp'); // Format: Jan 1, 2023, 12:00 PM
  };

  // Filter complaints based on search query and status filter
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (complaint.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.user?.reg_number?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && complaint.status === statusFilter;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Complaint Management</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" /> 
              Student Complaints
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Input 
                  placeholder="Search complaints..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
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
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{complaint.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">
                              Reg: {complaint.user?.reg_number || 'N/A'}, Room: {complaint.user?.room_number || 'N/A'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={complaint.subject}>
                          {complaint.subject}
                        </TableCell>
                        <TableCell>{getCategoryLabel(complaint.category)}</TableCell>
                        <TableCell>{formatDate(complaint.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewComplaint(complaint)}
                            >
                              View Details
                            </Button>
                            <Select 
                              value={complaint.status} 
                              onValueChange={(value) => handleStatusChange(complaint.id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="Set Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No complaints found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedComplaint && (
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Student Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <p><span className="font-semibold">Name:</span> {selectedComplaint.user?.name || 'Unknown'}</p>
                  <p><span className="font-semibold">Registration No:</span> {selectedComplaint.user?.reg_number || 'N/A'}</p>
                  <p><span className="font-semibold">Room Number:</span> {selectedComplaint.user?.room_number || 'N/A'}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Complaint</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{selectedComplaint.subject}</h4>
                      <p className="text-sm">
                        <span className="inline-block mr-3">
                          <Badge variant="outline">{getCategoryLabel(selectedComplaint.category)}</Badge>
                        </span>
                        <span className="text-gray-500">{formatDate(selectedComplaint.created_at)}</span>
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(selectedComplaint.status)}
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Change Status</h3>
              <div className="flex space-x-4">
                <Button 
                  variant={selectedComplaint.status === 'pending' ? 'default' : 'outline'} 
                  className={selectedComplaint.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                  onClick={() => handleStatusChange(selectedComplaint.id, 'pending')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                </Button>
                <Button 
                  variant={selectedComplaint.status === 'in_progress' ? 'default' : 'outline'} 
                  className={selectedComplaint.status === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                  onClick={() => handleStatusChange(selectedComplaint.id, 'in_progress')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  In Progress
                </Button>
                <Button 
                  variant={selectedComplaint.status === 'resolved' ? 'default' : 'outline'} 
                  className={selectedComplaint.status === 'resolved' ? 'bg-green-500 hover:bg-green-600' : ''}
                  onClick={() => handleStatusChange(selectedComplaint.id, 'resolved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolved
                </Button>
              </div>
            </div>
            
            <div className="mt-8">
              <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                Close Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplaintManagement;
