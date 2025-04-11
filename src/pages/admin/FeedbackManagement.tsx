
import React, { useState } from 'react';
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
  Send 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const FeedbackManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Sample feedback data
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, type: 'complaint', userId: 'user123', userName: 'John Doe', roomNumber: 'A-101', subject: 'Poor food quality', message: 'The rice served yesterday was undercooked.', status: 'pending', date: '2025-04-10', response: '' },
    { id: 2, type: 'suggestion', userId: 'user456', userName: 'Jane Smith', roomNumber: 'B-205', subject: 'Menu suggestion', message: 'It would be great if you could add more fruit options for breakfast.', status: 'in-progress', date: '2025-04-09', response: 'We are considering this suggestion.' },
    { id: 3, type: 'complaint', userId: 'user789', userName: 'Robert Brown', roomNumber: 'C-310', subject: 'Hygiene concern', message: 'I found a hair in my food today.', status: 'resolved', date: '2025-04-08', response: 'We apologize for the inconvenience. We have taken measures to ensure better hygiene standards.' },
    { id: 4, type: 'appreciation', userId: 'user101', userName: 'Lisa Wong', roomNumber: 'A-110', subject: 'Great dinner!', message: 'The special dinner yesterday was amazing. Thank you!', status: 'resolved', date: '2025-04-07', response: 'Thank you for your kind feedback!' },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  
  // Check if user is admin
  const isAdmin = user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'complaint':
        return <Badge className="bg-red-500">Complaint</Badge>;
      case 'suggestion':
        return <Badge className="bg-blue-500">Suggestion</Badge>;
      case 'appreciation':
        return <Badge className="bg-green-500">Appreciation</Badge>;
      default:
        return <Badge>Other</Badge>;
    }
  };

  const handleViewFeedback = (feedback: any) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response);
  };

  const handleSendResponse = () => {
    if (!selectedFeedback) return;
    
    // Update the feedback with the response
    const updatedFeedbacks = feedbacks.map(fb => 
      fb.id === selectedFeedback.id 
        ? { ...fb, response: responseText, status: 'resolved' } 
        : fb
    );
    
    setFeedbacks(updatedFeedbacks);
    setSelectedFeedback({ ...selectedFeedback, response: responseText, status: 'resolved' });
    
    toast({
      title: "Response sent",
      description: "Your response has been sent successfully."
    });
  };

  const filteredFeedbacks = feedbacks.filter(fb => 
    fb.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    fb.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fb.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fb.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Feedback Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Feedback & Complaints</CardTitle>
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
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="complaints">Complaints</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedbacks.map((feedback) => (
                        <TableRow key={feedback.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell>{getTypeBadge(feedback.type)}</TableCell>
                          <TableCell className="font-medium">
                            {feedback.userName}
                            <div className="text-xs text-gray-500">Room {feedback.roomNumber}</div>
                          </TableCell>
                          <TableCell>{feedback.subject}</TableCell>
                          <TableCell>{feedback.date}</TableCell>
                          <TableCell>{getStatusBadge(feedback.status)}</TableCell>
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
                </TabsContent>
                
                {/* Similar TabsContent for other tabs */}
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
                      <h3 className="font-medium">{selectedFeedback.subject}</h3>
                      <p className="text-sm text-gray-500">From: {selectedFeedback.userName} ({selectedFeedback.roomNumber})</p>
                    </div>
                    <div>
                      {getStatusBadge(selectedFeedback.status)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <p className="text-sm">{selectedFeedback.message}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Response:</label>
                    <Textarea 
                      value={responseText} 
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response here..."
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-mess-600 hover:bg-mess-700"
                    onClick={handleSendResponse}
                    disabled={!responseText.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" /> Send Response
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
