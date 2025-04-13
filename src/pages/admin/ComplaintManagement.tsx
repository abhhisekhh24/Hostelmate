
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  profiles?: {
    name: string;
    reg_number: string;
    room_number: string;
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
  
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles(
            name, 
            reg_number,
            room_number
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching complaints:", error);
        toast({
          title: "Error fetching complaints",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Complaint[];
    }
  });

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
    return format(date, 'PPp');
  };

  // Filter complaints based on search query and status filter
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.profiles?.reg_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && complaint.status === statusFilter;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Complaint Management</h1>
      </div>
      
      <Card className="mb-6 border dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <MessageSquare className="h-5 w-5 mr-2" /> 
              Student Complaints
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Input 
                  placeholder="Search complaints..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full dark:bg-gray-800 dark:border-gray-700"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 dark:bg-gray-800 dark:border-gray-700">
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
            <div className="rounded-md border overflow-hidden dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Student</TableHead>
                    <TableHead className="dark:text-gray-300">Subject</TableHead>
                    <TableHead className="dark:text-gray-300">Category</TableHead>
                    <TableHead className="dark:text-gray-300">Date</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id} className="dark:border-gray-700">
                        <TableCell className="dark:text-gray-300">
                          <div>
                            <p className="font-medium">{complaint.profiles?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Reg: {complaint.profiles?.reg_number || 'N/A'}, Room: {complaint.profiles?.room_number || 'N/A'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate dark:text-gray-300" title={complaint.subject}>
                          {complaint.subject}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">{getCategoryLabel(complaint.category)}</TableCell>
                        <TableCell className="dark:text-gray-300">{formatDate(complaint.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewComplaint(complaint)}
                              className="dark:border-gray-700 dark:text-gray-300"
                            >
                              View Details
                            </Button>
                            <Select 
                              value={complaint.status} 
                              onValueChange={(value) => handleStatusChange(complaint.id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-9 dark:bg-gray-800 dark:border-gray-700">
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
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
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
        <Card className="border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Complaint Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Student Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700">
                  <p className="dark:text-gray-300"><span className="font-semibold">Name:</span> {selectedComplaint.profiles?.name || 'Unknown'}</p>
                  <p className="dark:text-gray-300"><span className="font-semibold">Registration No:</span> {selectedComplaint.profiles?.reg_number || 'N/A'}</p>
                  <p className="dark:text-gray-300"><span className="font-semibold">Room Number:</span> {selectedComplaint.profiles?.room_number || 'N/A'}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Complaint</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg dark:text-gray-100">{selectedComplaint.subject}</h4>
                      <p className="text-sm">
                        <span className="inline-block mr-3">
                          <Badge variant="outline">{getCategoryLabel(selectedComplaint.category)}</Badge>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">{formatDate(selectedComplaint.created_at)}</span>
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
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Change Status</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedComplaint.status === 'pending' ? 'default' : 'outline'} 
                  className={selectedComplaint.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : 'dark:border-gray-700 dark:text-gray-300'}
                  onClick={() => handleStatusChange(selectedComplaint.id, 'pending')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                </Button>
                <Button 
                  variant={selectedComplaint.status === 'in_progress' ? 'default' : 'outline'} 
                  className={selectedComplaint.status === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600' : 'dark:border-gray-700 dark:text-gray-300'}
                  onClick={() => handleStatusChange(selectedComplaint.id, 'in_progress')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  In Progress
                </Button>
                <Button 
                  variant={selectedComplaint.status === 'resolved' ? 'default' : 'outline'} 
                  className={selectedComplaint.status === 'resolved' ? 'bg-green-500 hover:bg-green-600' : 'dark:border-gray-700 dark:text-gray-300'}
                  onClick={() => handleStatusChange(selectedComplaint.id, 'resolved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolved
                </Button>
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                variant="outline" 
                onClick={() => setSelectedComplaint(null)}
                className="dark:border-gray-700 dark:text-gray-300"
              >
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
