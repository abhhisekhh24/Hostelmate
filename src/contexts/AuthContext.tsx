
import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  regNumber: string;
  phoneNumber?: string;
  avatar?: string;
  theme?: 'light' | 'dark';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, regNumber: string) => Promise<void>;
  register: (name: string, email: string, password: string, roomNumber: string, regNumber: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (updates: Partial<User>) => void;
  toggleTheme: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem('hostelMessUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      if (userData.theme) {
        setTheme(userData.theme);
        if (userData.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, regNumber: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to authenticate
      // For now, we'll simulate authentication
      if (email === 'demo@example.com' && password === 'Password1!' && regNumber === '1234567890') {
        const userData: User = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          roomNumber: 'A-101',
          regNumber: '1234567890',
          phoneNumber: '9876543210',
          theme: 'light',
        };
        setUser(userData);
        localStorage.setItem('hostelMessUser', JSON.stringify(userData));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, roomNumber: string, regNumber: string, phoneNumber?: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to register
      // For now, we'll simulate registration
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        roomNumber,
        regNumber,
        phoneNumber,
        theme: 'light',
      };
      setUser(userData);
      localStorage.setItem('hostelMessUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostelMessUser');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('hostelMessUser', JSON.stringify(updatedUser));
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (user) {
      const updatedUser = { ...user, theme: newTheme };
      setUser(updatedUser);
      localStorage.setItem('hostelMessUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading, 
      updateProfile,
      toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};
