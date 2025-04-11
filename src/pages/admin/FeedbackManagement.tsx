
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Search, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Send,
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define types for feedback
type Feedback = {
  id: string;
  user_id: string;
  user_profile_id?: string | null;
  meal_type: string;
  rating: string;
  comment: string | null;
  created_at: string;
  user?: {
    name: string;
    room_number: string;
    reg_number: string;
    phone_number?: string | null;
  };
  status?: 'pending' | 'in-progress' | 'resolved';
  response?: string;
};

// Define type for admin response
type AdminResponse = {
  id: string;
  feedback_id: string;
  admin_id: string;
  response: string;
  created_at: string;
};

const FeedbackManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch feedbacks with user details
  const { data: feedbackData = [], isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      // First get all feedbacks
      const { data: feedbacks, error: feedbackError } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (feedbackError) throw feedbackError;
      
      // Get all admin responses
      const { data: responses, error: responsesError } = await supabase
        .from('admin_responses')
        .select('*');
      
      if (responsesError) throw responsesError;
      
      // Get user profiles for feedbacks
      const userIds = [...new Set(feedbacks.map(fb => fb.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, room_number, reg_number, phone_number')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Map profiles and responses to feedbacks
      const enrichedFeedbacks = feedbacks.map(feedback => {
        const userProfile = profiles.find(p => p.id === feedback.user_id);
        const feedbackResponse = responses.find(r => r.feedback_id === feedback.id);
        
        let status: 'pending' | 'in-progress' | 'resolved' = 'pending';
        if (feedbackResponse) {
          status = 'resolved';
        }
        
        return {
          ...feedback,
          user: userProfile,
          status,
          response: feedbackResponse?.response
        };
      });
      
      return enrichedFeedbacks as Feedback[];
    }
  });

  // Add admin response mutation
  const addResponse = useMutation({
    mutationFn: async (data: { feedback_id: string; response: string }) => {
      if (!user?.id) throw new Error("Admin ID is required");
      
      const { data: response, error } = await supabase
        .from('admin_responses')
        .insert([
          {
            feedback_id: data.feedback_id,
            admin_id: user.id,
            response: data.response
          }
        ])
        .select();
      
      if (error) throw error;
      
      return response[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast({
        title: "Response sent",
        description: "Your response has been sent successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending response",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    // Subscribe to realtime updates for feedbacks and admin_responses
    const feedbackChannel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedbacks'
        },
        () => {
          // Refetch data when feedbacks change
          queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
        }
      )
      .subscribe();

    const responseChannel = supabase
      .channel('admin-response-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_responses'
        },
        () => {
          // Refetch data when responses change
          queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(responseChannel);
    };
  }, [queryClient]);

  const handleSendResponse = () => {
    if (!selectedFeedback || !responseText.trim()) return;
    
    addResponse.mutate({
      feedback_id: selectedFeedback.id,
      response: responseText
    });
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || '');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> In Progress
        </Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Resolved
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return <Badge className="bg-green-500">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-500">Good</Badge>;
      case 'average':
        return <Badge className="bg-yellow-500">Average</Badge>;
      case 'poor':
        return <Badge className="bg-red-500">Poor</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter feedbacks based on search query and active tab
  const filteredFeedbacks = feedbackData.filter(fb => {
    const matchesSearch = 
      (fb.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      fb.meal_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.user?.room_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.user?.reg_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.rating.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && fb.status === 'pending';
    if (activeTab === 'in-progress') return matchesSearch && fb.status === 'in-progress';
    if (activeTab === 'resolved') return matchesSearch && fb.status === 'resolved';
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Feedback Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Feedback & Ratings</CardTitle>
                <div className="relative w-64">
                  <Input 
                    placeholder="Search feedback..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-mess-600" />
                    </div>
                  ) : filteredFeedbacks.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rating</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>Meal</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFeedbacks.map((feedback) => (
                          <TableRow key={feedback.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>{getRatingBadge(feedback.rating)}</TableCell>
                            <TableCell className="font-medium">
                              {feedback.user?.name || 'Unknown User'}
                              <div className="text-xs text-gray-500">Room {feedback.user?.room_number || 'N/A'}</div>
                              <div className="text-xs text-gray-500">Reg# {feedback.user?.reg_number || 'N/A'}</div>
                            </TableCell>
                            <TableCell>{feedback.meal_type}</TableCell>
                            <TableCell>{formatDate(feedback.created_at)}</TableCell>
                            <TableCell>{getStatusBadge(feedback.status || 'pending')}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewFeedback(feedback)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No feedback found matching your filters.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedFeedback ? 'Feedback Details' : 'Select Feedback'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFeedback ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{selectedFeedback.meal_type} Feedback</h3>
                      <p className="text-sm text-gray-500">
                        From: {selectedFeedback.user?.name || 'Unknown'} 
                      </p>
                      <p className="text-sm text-gray-500">
                        Room: {selectedFeedback.user?.room_number || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Reg#: {selectedFeedback.user?.reg_number || 'N/A'}
                      </p>
                      {selectedFeedback.user?.phone_number && (
                        <p className="text-sm text-gray-500">
                          Phone: {selectedFeedback.user.phone_number}
                        </p>
                      )}
                    </div>
                    <div>
                      {getStatusBadge(selectedFeedback.status || 'pending')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Rating: {selectedFeedback.rating}</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <p className="text-sm">{selectedFeedback.comment || 'No additional comments provided.'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Response:</label>
                    <Textarea 
                      value={responseText} 
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response here..."
                      rows={4}
                      disabled={selectedFeedback.status === 'resolved'}
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-mess-600 hover:bg-mess-700"
                    onClick={handleSendResponse}
                    disabled={
                      !responseText.trim() || 
                      addResponse.isPending ||
                      selectedFeedback.status === 'resolved'
                    }
                  >
                    {addResponse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="h-4 w-4 mr-2" /> 
                    {selectedFeedback.status === 'resolved' ? 'Response Sent' : 'Send Response'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p>Select a feedback item to view details and respond</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
