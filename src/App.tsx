
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { AuthProvider } from './contexts/AuthContext';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import FoodMenu from './pages/FoodMenu';
import BookMeal from './pages/BookMeal';
import Complaints from './pages/Complaints';
import Feedback from './pages/Feedback';
import HelpDesk from './pages/HelpDesk';
import NotFound from './pages/NotFound';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import MenuSchedule from './pages/admin/MenuSchedule';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import UserManagement from './pages/admin/UserManagement';
import Announcements from './pages/admin/Announcements';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import ComplaintManagement from './pages/admin/ComplaintManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Handle incorrect /menu URL - redirect to /food-menu */}
              <Route path="/menu" element={<Navigate to="/food-menu" replace />} />
              
              {/* Handle /admin URL - redirect to /admin/dashboard */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/food-menu" element={<FoodMenu />} />
                <Route path="/book-meal" element={<BookMeal />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/help-desk" element={<HelpDesk />} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/menu-management" element={<MenuManagement />} />
                <Route path="/admin/menu-schedule" element={<MenuSchedule />} />
                <Route path="/admin/feedback-management" element={<FeedbackManagement />} />
                <Route path="/admin/user-management" element={<UserManagement />} />
                <Route path="/admin/announcements" element={<Announcements />} />
                <Route path="/admin/complaints" element={<ComplaintManagement />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
