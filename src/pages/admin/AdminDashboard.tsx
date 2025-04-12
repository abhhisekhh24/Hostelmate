import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Bell, MessageSquare, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.email?.includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Menu Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-mess-50 dark:bg-mess-900">
            <CardTitle className="flex items-center">
              <Utensils className="mr-2 h-5 w-5 text-mess-600" />
              Menu Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage daily and weekly hostel menu items.</p>
            <div className="flex justify-between">
              <Button asChild variant="outline">
                <Link to="/admin/menu-management">Daily Menu</Link>
              </Button>
              <Button asChild>
                <Link to="/admin/menu-schedule">Weekly Schedule</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Announcements Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-mess-50 dark:bg-mess-900">
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-mess-600" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create and manage hostel announcements.</p>
            <div className="flex justify-end">
              <Button asChild>
                <Link to="/admin/announcements">Manage Announcements</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Complaints Card - Added */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-mess-50 dark:bg-mess-900">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-mess-600" />
              Complaints
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Review and respond to student complaints.</p>
            <div className="flex justify-end">
              <Button asChild>
                <Link to="/admin/complaints">Manage Complaints</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Feedback Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-mess-50 dark:bg-mess-900">
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5 text-mess-600" />
              Feedback Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">View and analyze student feedback on mess services.</p>
            <div className="flex justify-end">
              <Button asChild>
                <Link to="/admin/feedback-management">View Feedback</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* User Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-mess-50 dark:bg-mess-900">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-mess-600" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage student accounts and permissions.</p>
            <div className="flex justify-end">
              <Button asChild>
                <Link to="/admin/user-management">Manage Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional cards... */}
      </div>
    </div>
  );
};

export default AdminDashboard;
