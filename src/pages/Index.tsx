
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Logo from '@/components/logo/Logo';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [showLoader, setShowLoader] = useState(true);
  
  // Only show the loader if authentication is taking more than 300ms
  // This helps with perceived performance
  useEffect(() => {
    if (!isLoading) {
      setShowLoader(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading && showLoader) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-mess-100 to-mess-300 dark:from-mess-900 dark:to-mess-black-dark text-center p-4">
        <div className="space-y-6">
          <Logo size="lg" />
          <h2 className="text-2xl font-bold text-mess-700 dark:text-mess-300">HostelMate</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mess-700 dark:border-mess-300"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default Index;
