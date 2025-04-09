
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FoodMenu from "./pages/FoodMenu";
import BookMeal from "./pages/BookMeal";
import Feedback from "./pages/Feedback";
import Complaints from "./pages/Complaints";
import NotFound from "./pages/NotFound";

// Components
import Layout from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            
            {/* Redirect root to login/dashboard based on auth status */}
            <Route path="/" element={<Login />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
