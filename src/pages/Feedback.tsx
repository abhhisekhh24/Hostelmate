
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Feedback = {
  id: string;
  meal_type: string;
  rating: string;
  comment: string | null;
  created_at: string;
}

const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const Feedback = () => {
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [rating, setRating] = useState<string>('');
  const [comment, setComment] = useState('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFeedbacks();
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setFeedbacks(data as Feedback[]);
      }
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error.message);
      toast({
        title: "Error fetching feedbacks",
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
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      return;
    }
    
    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your feedback.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([
          { 
            user_id: user.id,
            meal_type: activeMeal,
            rating,
            comment: comment || null
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: `Your feedback for ${activeMeal} has been submitted successfully.`,
      });

      // Refresh feedbacks list
      fetchFeedbacks();
      
      // Reset form
      setRating('');
      setComment('');
    } catch (error: any) {
      console.error('Error submitting feedback:', error.message);
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

  // Get the rating label for display
  const getRatingLabel = (rating: string) => {
    const ratings = {
      'excellent': 'Excellent',
      'good': 'Good',
      'average': 'Average',
      'poor': 'Poor'
    };
    return ratings[rating as keyof typeof ratings] || rating;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Meal Feedback</h1>
      
      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="meal-type">Select Meal</Label>
                <Tabs value={activeMeal} onValueChange={setActiveMeal} className="w-full mt-2">
                  <TabsList className="grid grid-cols-4">
                    {mealTypes.map((meal) => (
                      <TabsTrigger key={meal} value={meal}>{meal}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <Label htmlFor="rating" className="mb-2 block">How would you rate today's {activeMeal.toLowerCase()}?</Label>
                <RadioGroup id="rating" value={rating} onValueChange={setRating} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="excellent" />
                    <Label htmlFor="excellent">Excellent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="good" />
                    <Label htmlFor="good">Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="average" id="average" />
                    <Label htmlFor="average">Average</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="poor" />
                    <Label htmlFor="poor">Poor</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="comment">Additional Comments</Label>
                <Textarea
                  id="comment"
                  placeholder="Please share your thoughts on the meal..."
                  className="mt-1"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="w-full bg-mess-600 hover:bg-mess-700"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </CardFooter>
      </Card>

      {/* Feedback History */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>My Feedback History</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{formatDate(feedback.created_at)}</TableCell>
                    <TableCell>{feedback.meal_type}</TableCell>
                    <TableCell>{getRatingLabel(feedback.rating)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {feedback.comment || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              You haven't submitted any feedback yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;
