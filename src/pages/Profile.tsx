
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { User, Pencil, Save, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const {
    user,
    updateProfile
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const avatarOptions = ["https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", "https://api.dicebear.com/7.x/avataaars/svg?seed=Dusty", "https://api.dicebear.com/7.x/avataaars/svg?seed=Missy", "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", "https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey", "https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper"];
  
  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleSaveClick = () => {
    updateProfile({
      name,
      phoneNumber,
      avatar
    });
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully."
    });
    setIsEditing(false);
  };
  
  const handleAvatarSelect = (avatarUrl: string) => {
    setAvatar(avatarUrl);
  };
  
  return <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">My Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatar || ''} alt={user.name} />
                <AvatarFallback className="text-lg bg-mess-600 text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && <div className="grid grid-cols-3 gap-2 w-full pt-2">
                  {avatarOptions.map((avatarUrl, index) => <button key={index} className={`p-1 rounded-lg ${avatar === avatarUrl ? 'ring-2 ring-mess-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`} onClick={() => handleAvatarSelect(avatarUrl)}>
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={avatarUrl} alt={`Avatar option ${index + 1}`} />
                        <AvatarFallback className="bg-mess-300">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </button>)}
                </div>}
              
              <div className="text-center">
                <h4 className="font-medium text-lg">{user.name}</h4>
                <p className="text-muted-foreground">{user.regNumber}</p>
              </div>
              
              {!isEditing ? <Button variant="outline" className="w-full" onClick={handleEditClick}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button> : <Button className="w-full bg-mess-600 hover:bg-mess-700" onClick={handleSaveClick}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>View and update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? <Input id="name" value={name} onChange={e => setName(e.target.value)} /> : <div className="p-2 border rounded-md bg-background dark:bg-background">{user.name}</div>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="p-2 border rounded-md bg-background dark:bg-background">{user.email}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <div className="p-2 border rounded-md bg-background dark:bg-background">{user.regNumber}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <div className="p-2 border rounded-md bg-background dark:bg-background">{user.roomNumber}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                {isEditing ? <Input id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter phone number" /> : <div className="p-2 border rounded-md bg-background dark:bg-background">
                    {user.phoneNumber || 'Not provided'}
                  </div>}
              </div>

              <div className="pt-6">
                <Link to="/meal-statistics" className="inline-block w-full">
                  <Button 
                    className="w-full bg-gradient-to-r from-mess-600 to-mess-500 hover:from-mess-700 hover:to-mess-600 text-white font-medium py-3 rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    View Meal Statistics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};

export default Profile;
