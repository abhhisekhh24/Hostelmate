
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const Feedback = () => {
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [rating, setRating] = useState<string>('');
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your feedback.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send the feedback data to an API
    toast({
      title: "Feedback Submitted",
      description: `Your feedback for ${activeMeal} has been submitted successfully.`,
    });

    // Reset form
    setRating('');
    setComment('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Meal Feedback</h1>
      
      <Card className="max-w-2xl mx-auto">
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
          >
            Submit Feedback
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Feedback;
