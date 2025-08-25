
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Mail, MapPin, Clock, Info } from 'lucide-react';

const HelpDesk = () => {
  const contacts = [
    {
      role: "King",
      name: "Dr. Ramesh Kumar",
      phone: "7008567273",
      email: "warden@example.com",
      officeHours: "9:00 AM - 5:00 PM",
      location: "Admin Block, 1st Floor"
    },
    {
      role: "Caretaker",
      name: "Mr. Suresh Singh",
      phone: "8637265368",
      email: "caretaker@example.com",
      officeHours: "24/7 (Shifts)",
      location: "Hostel Main Entrance"
    },
    {
      role: "Superintendent",
      name: "Prof. Amit Verma",
      phone: "9876543210",
      email: "superintendent@example.com",
      officeHours: "10:00 AM - 4:00 PM",
      location: "Admin Block, 2nd Floor"
    }
  ];

  const emergencies = [
    {
      title: "Medical Emergency",
      contact: "9876543210 (Campus Medical Center)",
      description: "For any medical emergencies, injuries, or health issues"
    },
    {
      title: "Security Issues",
      contact: "8765432109 (Campus Security)",
      description: "For security concerns, suspicious activities, or threats"
    },
    {
      title: "Maintenance Emergency",
      contact: "7654321098 (Maintenance Team)",
      description: "For urgent plumbing, electrical, or structural issues"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Help Desk</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Important contacts for hostel-related inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {contacts.map((contact, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-lg text-mess-600">{contact.role}</h3>
                  <p className="text-sm font-medium mb-2">{contact.name}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <PhoneCall className="h-4 w-4 mr-2 text-mess-500" />
                      <span className="font-medium">Phone:</span>
                      <a href={`tel:${contact.phone}`} className="ml-2 text-mess-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-mess-500" />
                      <span className="font-medium">Email:</span>
                      <a href={`mailto:${contact.email}`} className="ml-2 text-mess-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-mess-500" />
                      <span className="font-medium">Office Hours:</span>
                      <span className="ml-2">{contact.officeHours}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-mess-500" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{contact.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>Who to contact in case of emergencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergencies.map((emergency, index) => (
                <div key={index} className="bg-mess-100 dark:bg-mess-900 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-mess-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-mess-700 dark:text-mess-300">{emergency.title}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 my-1">{emergency.description}</p>
                      <p className="text-sm font-medium">
                        <span className="text-mess-600">{emergency.contact}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-mess-200 dark:bg-mess-800 rounded-lg p-4">
              <h4 className="font-semibold text-center mb-2">Important Note</h4>
              <p className="text-sm text-center">
                For all general inquiries related to mess operations, food quality, or menu suggestions, 
                please use the Feedback or Complaints sections of the application.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h4 className="font-medium text-mess-600">How do I book a meal?</h4>
              <p className="text-sm mt-1">
                Navigate to the Book Meal section in the app and select your preferred time slot for
                breakfast, lunch, snacks, or dinner.
              </p>
            </div>
            
            <div className="border-b pb-3">
              <h4 className="font-medium text-mess-600">What should I do if I miss a meal?</h4>
              <p className="text-sm mt-1">
                If you've booked but missed a meal, no action is required. However, repeated no-shows
                might affect your allocation priority in the future.
              </p>
            </div>
            
            <div className="border-b pb-3">
              <h4 className="font-medium text-mess-600">How do I provide feedback about the food?</h4>
              <p className="text-sm mt-1">
                Use the Feedback section in the app to rate your meal experience and provide detailed comments.
              </p>
            </div>
            
            <div className="border-b pb-3">
              <h4 className="font-medium text-mess-600">What if I have special dietary requirements?</h4>
              <p className="text-sm mt-1">
                Contact the Mess Manager directly through the provided contact information to discuss your
                specific dietary needs.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-mess-600">How can I get my mess fee receipt?</h4>
              <p className="text-sm mt-1">
                Mess fee receipts can be collected from the Accounts Office during working hours or requested
                via email to accounts@example.com.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpDesk;
