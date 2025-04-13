
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon } from 'lucide-react';

const Settings = () => {
  const { user, toggleTheme } = useAuth();
  
  const isDarkMode = user?.theme === 'dark';

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Settings</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-md border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Appearance</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-mess-500" />
                ) : (
                  <Sun className="h-5 w-5 text-mess-500" />
                )}
                <div>
                  <Label htmlFor="theme-mode" className="text-base text-gray-900 dark:text-gray-100">Theme Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDarkMode ? 'Currently using dark mode' : 'Currently using light mode'}
                  </p>
                </div>
              </div>
              <Switch
                id="theme-mode"
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
