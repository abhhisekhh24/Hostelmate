
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
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth pages without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* All other pages with layout */}
          <Route path="/" element={<Layout><Index /></Layout>} />
          
          {/* Handle incorrect /menu URL - redirect to /food-menu */}
          <Route path="/menu" element={<Navigate to="/food-menu" replace />} />
          
          {/* Handle /admin URL - redirect to /admin/dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="/food-menu" element={<Layout><FoodMenu /></Layout>} />
            <Route path="/book-meal" element={<Layout><BookMeal /></Layout>} />
            <Route path="/complaints" element={<Layout><Complaints /></Layout>} />
            <Route path="/feedback" element={<Layout><Feedback /></Layout>} />
            <Route path="/help-desk" element={<Layout><HelpDesk /></Layout>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
            <Route path="/admin/menu-management" element={<Layout><MenuManagement /></Layout>} />
            <Route path="/admin/menu-schedule" element={<Layout><MenuSchedule /></Layout>} />
            <Route path="/admin/feedback-management" element={<Layout><FeedbackManagement /></Layout>} />
            <Route path="/admin/user-management" element={<Layout><UserManagement /></Layout>} />
            <Route path="/admin/announcements" element={<Layout><Announcements /></Layout>} />
            <Route path="/admin/complaints" element={<Layout><ComplaintManagement /></Layout>} />
          </Route>
          
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
        <Toaster />
        <Sonner />
      </Router>
    </AuthProvider>
  );
}

export default App;
