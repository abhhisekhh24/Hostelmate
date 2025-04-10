
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Complaint = {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
}

const Complaints = () => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setComplaints(data as Complaint[]);
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error.message);
      toast({
        title: "Error fetching complaints",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a complaint.",
        variant: "destructive",
      });
      return;
    }
    
    if (!subject || !category || !description) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all fields before submitting your complaint.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('complaints')
        .insert([
          { 
            user_id: user.id,
            subject, 
            category, 
            description,
            status: 'pending'
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted successfully. We'll look into it as soon as possible.",
      });

      // Refresh complaints list
      fetchComplaints();
      
      // Reset form
      setSubject('');
      setCategory('');
      setDescription('');
    } catch (error: any) {
      console.error('Error submitting complaint:', error.message);
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get the status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Complaint Box</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Complaint</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Brief title for your complaint" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food-quality">Food Quality</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="timing">Timing Issues</SelectItem>
                      <SelectItem value="facilities">Facilities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Please provide details about your complaint..." 
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit}
                className="w-full bg-mess-600 hover:bg-mess-700"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Display Complaints History */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>My Complaints History</CardTitle>
            </CardHeader>
            <CardContent>
              {complaints.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>{formatDate(complaint.created_at)}</TableCell>
                        <TableCell>{complaint.subject}</TableCell>
                        <TableCell>{complaint.category}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  You haven't submitted any complaints yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>Be specific about your complaint and provide all relevant details</span>
                </li>
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>Mention date and time of incident if applicable</span>
                </li>
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>Avoid using offensive language</span>
                </li>
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>If your complaint is urgent, please also inform the mess manager directly</span>
                </li>
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>All complaints are reviewed within 24-48 hours</span>
                </li>
              </ul>
              <div className="mt-6 p-3 bg-mess-50 rounded border border-mess-100">
                <p className="text-sm font-medium text-mess-700">Need immediate assistance?</p>
                <p className="text-sm mt-1">Contact Mess Manager: <span className="font-medium">+1 (234) 567-8901</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
