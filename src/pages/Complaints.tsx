
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

const Complaints = () => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !category || !description) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all fields before submitting your complaint.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send the complaint data to an API
    toast({
      title: "Complaint Submitted",
      description: "Your complaint has been submitted successfully. We'll look into it as soon as possible.",
    });

    // Reset form
    setSubject('');
    setCategory('');
    setDescription('');
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
              >
                Submit Complaint
              </Button>
            </CardFooter>
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
