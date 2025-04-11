
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Use React.lazy for code splitting
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FoodMenu = lazy(() => import("./pages/FoodMenu"));
const BookMeal = lazy(() => import("./pages/BookMeal"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Complaints = lazy(() => import("./pages/Complaints"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const HelpDesk = lazy(() => import("./pages/HelpDesk"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Index = lazy(() => import("./pages/Index"));

// Non-lazy load Layout as it's used by multiple routes
import Layout from "./components/layout/Layout";

// Loading Component
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-mess-100 to-mess-300 dark:from-mess-900 dark:to-mess-black-dark">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mess-700 dark:border-mess-300"></div>
  </div>
);

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching on window focus for better performance
      retry: 1, // Only retry failed queries once
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <Layout requireAuth>
                      <Dashboard />
                    </Layout>
                  }
                />
                <Route
                  path="/menu"
                  element={
                    <Layout requireAuth>
                      <FoodMenu />
                    </Layout>
                  }
                />
                <Route
                  path="/book-meal"
                  element={
                    <Layout requireAuth>
                      <BookMeal />
                    </Layout>
                  }
                />
                <Route
                  path="/feedback"
                  element={
                    <Layout requireAuth>
                      <Feedback />
                    </Layout>
                  }
                />
                <Route
                  path="/complaints"
                  element={
                    <Layout requireAuth>
                      <Complaints />
                    </Layout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Layout requireAuth>
                      <Profile />
                    </Layout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Layout requireAuth>
                      <Settings />
                    </Layout>
                  }
                />
                <Route
                  path="/help-desk"
                  element={
                    <Layout requireAuth>
                      <HelpDesk />
                    </Layout>
                  }
                />
                
                {/* Redirect root to login/dashboard based on auth status */}
                <Route path="/" element={<Index />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Add a separate component to handle dark mode detection
const AppWrapper = () => {
  // Check for system dark mode preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    
    // Add passive option to event listeners for better performance
    document.addEventListener('touchstart', function() {}, {passive: true});
    document.addEventListener('touchmove', function() {}, {passive: true});
  }, []);

  return <App />;
};

export default AppWrapper;
