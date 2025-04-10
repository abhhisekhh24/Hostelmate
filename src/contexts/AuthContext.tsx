
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database } from '@/integrations/supabase/types';

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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, roomNumber: string, regNumber: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  toggleTheme: () => Promise<void>;
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
  const { toast } = useToast();

  // Function to transform Supabase user data into our User type
  const formatUser = async (supabaseUser: any) => {
    if (!supabaseUser) return null;

    // Get the user profile from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    // Safety check if profileData is null
    if (!profileData) {
      console.error('No profile data found for user:', supabaseUser.id);
      return null;
    }

    // Apply the user's theme if it exists
    if (profileData.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profileData.name,
      roomNumber: profileData.room_number,
      regNumber: profileData.reg_number,
      phoneNumber: profileData.phone_number,
      avatar: profileData.avatar,
      theme: (profileData.theme as 'light' | 'dark') || 'light',
    };
  };

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        if (session?.user) {
          const formattedUser = await formatUser(session.user);
          setUser(formattedUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const formattedUser = await formatUser(session.user);
        setUser(formattedUser);
      }
      setIsLoading(false);
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      const formattedUser = await formatUser(data.user);
      setUser(formattedUser);
      
      toast({
        title: "Login successful",
        description: "Welcome back to the Hostel Mess Management System",
      });
    } catch (error: any) {
      console.error('Login failed:', error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, roomNumber: string, regNumber: string, phoneNumber?: string) => {
    setIsLoading(true);
    try {
      // Register the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            roomNumber,
            regNumber,
            phoneNumber,
          },
        },
      });

      if (error) throw error;

      // After signup, the trigger we created will automatically add the user to the profiles table
      // We should now be able to get their profile
      const formattedUser = await formatUser(data.user);
      setUser(formattedUser);
      
      toast({
        title: "Registration successful",
        description: "Welcome to the Hostel Mess Management System",
      });
    } catch (error: any) {
      console.error('Registration failed:', error.message);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Remove dark mode if it was set
      document.documentElement.classList.remove('dark');
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      // Prepare the updates for the profiles table format
      const profileUpdates: Record<string, any> = {};
      
      if (updates.name) profileUpdates.name = updates.name;
      if (updates.phoneNumber) profileUpdates.phone_number = updates.phoneNumber;
      if (updates.avatar) profileUpdates.avatar = updates.avatar;
      if (updates.theme && (updates.theme === 'light' || updates.theme === 'dark')) {
        profileUpdates.theme = updates.theme;
      }
      
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, ...updates };
      });

      // Apply theme change
      if (updates.theme) {
        if (updates.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error('Profile update failed:', error.message);
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleTheme = async () => {
    if (!user) return;
    
    const newTheme = user.theme === 'light' ? 'dark' : 'light';
    
    try {
      // Update theme in database
      const { error } = await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, theme: newTheme };
      });
      
      // Apply theme change to DOM
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error: any) {
      console.error('Theme toggle failed:', error.message);
      toast({
        title: "Theme toggle failed",
        description: error.message,
        variant: "destructive",
      });
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
