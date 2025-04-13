
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import FoodIllustrations from '@/components/animations/FoodIllustrations';
import Logo from '@/components/logo/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoggingIn(true);
      await login(email, password);
      // Don't navigate here - the useEffect will handle this when user state updates
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email before logging in');
      } else {
        setError(err.message || 'Failed to login. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-mess-100 to-mess-300 dark:from-mess-900 dark:to-mess-black-dark px-4 overflow-hidden">
      {/* Load FoodIllustrations component only when not in a login/loading state */}
      {!isLoggingIn && <FoodIllustrations />}
      
      <Card className="w-full max-w-md shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-mess-200 dark:border-mess-800 z-10">
        <CardHeader className="space-y-1 pt-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-mess-700 dark:text-mess-300">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the mess management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-mess-200 focus:border-mess-400 dark:border-mess-700 dark:focus:border-mess-500"
                disabled={isLoggingIn}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-mess-600 hover:text-mess-700 dark:text-mess-400 dark:hover:text-mess-300">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-mess-200 focus:border-mess-400 dark:border-mess-700 dark:focus:border-mess-500"
                disabled={isLoggingIn}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-mess-600 hover:bg-mess-700 dark:bg-mess-500 dark:hover:bg-mess-600 transition-colors duration-200"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-mess-600 hover:text-mess-700 dark:text-mess-400 dark:hover:text-mess-300 font-semibold">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
