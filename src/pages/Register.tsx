
import React, { useState } from 'react';
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

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    regNumber?: string;
    phoneNumber?: string;
    password?: string;
  }>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newValidationErrors: {
      regNumber?: string;
      phoneNumber?: string;
      password?: string;
    } = {};
    
    // Validate registration number
    if (regNumber.length !== 10 || !/^\d+$/.test(regNumber)) {
      newValidationErrors.regNumber = "Registration number must be 10 digits";
    }
    
    // Validate phone number if provided
    if (phoneNumber && (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber))) {
      newValidationErrors.phoneNumber = "Phone number must be 10 digits";
    }
    
    // Validate password has at least one uppercase, one lowercase and one special character
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      newValidationErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one special character";
    }
    
    setValidationErrors(newValidationErrors);
    return Object.keys(newValidationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    
    if (!name || !email || !password || !confirmPassword || !roomNumber || !regNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      await register(name, email, password, roomNumber, regNumber, phoneNumber);
      toast({
        title: "Registration successful",
        description: "Welcome to the Hostel Mess Management System",
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-mess-100 to-mess-300 dark:from-mess-900 dark:to-mess-black-dark px-4 overflow-hidden">
      <FoodIllustrations />
      
      <Card className="w-full max-w-md shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-mess-200 dark:border-mess-800 z-10 my-8">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to register for the mess management system
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
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regNumber">Registration Number</Label>
              <Input 
                id="regNumber" 
                placeholder="10-digit number" 
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
              />
              {validationErrors.regNumber && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.regNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input 
                id="phoneNumber" 
                placeholder="10-digit number" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {validationErrors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.phoneNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input 
                id="roomNumber" 
                placeholder="A-101" 
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {validationErrors.password && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-mess-600 hover:bg-mess-700 dark:bg-mess-500 dark:hover:bg-mess-600 transition-colors duration-200">
              Sign up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-mess-600 hover:text-mess-700 dark:text-mess-400 dark:hover:text-mess-300 font-semibold">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
