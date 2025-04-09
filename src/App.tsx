
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FoodMenu from "./pages/FoodMenu";
import BookMeal from "./pages/BookMeal";
import Feedback from "./pages/Feedback";
import Complaints from "./pages/Complaints";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import HelpDesk from "./pages/HelpDesk";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Components
import Layout from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
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
  }, []);

  return <App />;
};

export default AppWrapper;
