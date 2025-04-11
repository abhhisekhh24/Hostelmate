
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  MessageSquare, 
  FileText, 
  Users, 
  Bell 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Check if user is admin - you'll need to implement this check properly
  // For now, this is a placeholder logic
  const isAdmin = user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const adminCards = [
    {
      title: "Menu Management",
      description: "Create and update daily/weekly food menus",
      icon: <FileText className="h-6 w-6 text-mess-600" />,
      link: "/admin/menu-management"
    },
    {
      title: "Feedback Management",
      description: "View and respond to user feedback",
      icon: <MessageSquare className="h-6 w-6 text-mess-600" />,
      link: "/admin/feedback-management"
    },
    {
      title: "User Management",
      description: "View registered hostel residents",
      icon: <Users className="h-6 w-6 text-mess-600" />,
      link: "/admin/user-management"
    },
    {
      title: "Announcements",
      description: "Create and manage mess announcements",
      icon: <Bell className="h-6 w-6 text-mess-600" />,
      link: "/admin/announcements"
    },
    {
      title: "Menu Schedule",
      description: "Plan and schedule future menus",
      icon: <CalendarIcon className="h-6 w-6 text-mess-600" />,
      link: "/admin/menu-schedule"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your hostel mess operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card, index) => (
          <Link key={index} to={card.link} className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
