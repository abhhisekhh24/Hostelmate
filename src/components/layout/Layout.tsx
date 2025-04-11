
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import AnnouncementsNotification from '../AnnouncementsNotification';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const { user, isLoading } = useAuth();

  if (requireAuth && !isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header>
        <Navbar />
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toaster />
      <Sonner />
    </div>
  );
};

export default Layout;
