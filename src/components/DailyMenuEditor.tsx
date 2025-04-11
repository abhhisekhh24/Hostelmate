import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";

type DailyMenu = {
  id: string;
  date: string;
  breakfast: string | null;
  lunch: string | null;
  snacks: string | null;
  dinner: string | null;
  created_at: string;
  updated_at: string;
};

const DailyMenuEditor = () => {
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [snacks, setSnacks] = useState('');
  const [dinner, setDinner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayMenu();
    
    // Subscribe to realtime updates for daily_menus
    const channel = supabase
      .channel('daily-menu-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'daily_menus',
          filter: `date=eq.${format(new Date(), 'yyyy-MM-dd')}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedMenu = payload.new as DailyMenu;
            setMenu(updatedMenu);
            setBreakfast(updatedMenu.breakfast || '');
            setLunch(updatedMenu.lunch || '');
            setSnacks(updatedMenu.snacks || '');
            setDinner(updatedMenu.dinner || '');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTodayMenu = async () => {
    try {
      setIsLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('daily_menus')
        .select('*')
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        setMenu(data);
        setBreakfast(data.breakfast || '');
        setLunch(data.lunch || '');
        setSnacks(data.snacks || '');
        setDinner(data.dinner || '');
      }
    } catch (error: any) {
      console.error('Error fetching today\'s menu:', error.message);
      toast({
        title: "Error",
        description: "Could not fetch today's menu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMenu = async () => {
    try {
      setIsSaving(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // If menu already exists, update it
      if (menu) {
        const { error } = await supabase
          .from('daily_menus')
          .update({
            breakfast,
            lunch,
            snacks,
            dinner,
            updated_at: new Date().toISOString()
          })
          .eq('id', menu.id);

        if (error) throw error;
      } else {
        // Otherwise create a new menu for today
        const { error } = await supabase
          .from('daily_menus')
          .insert([
            {
              date: today,
              breakfast,
              lunch,
              snacks,
              dinner
            }
          ]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Today's menu has been updated",
      });
    } catch (error: any) {
      console.error('Error saving menu:', error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-mess-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Menu ({format(new Date(), 'MMMM d, yyyy')})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Breakfast</label>
            <Textarea
              placeholder="Enter breakfast menu items"
              value={breakfast}
              onChange={(e) => setBreakfast(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Lunch</label>
            <Textarea
              placeholder="Enter lunch menu items"
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Snacks</label>
            <Textarea
              placeholder="Enter snacks menu items"
              value={snacks}
              onChange={(e) => setSnacks(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Dinner</label>
            <Textarea
              placeholder="Enter dinner menu items"
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSaveMenu} 
            className="w-full bg-mess-600 hover:bg-mess-700"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Today's Menu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyMenuEditor;
