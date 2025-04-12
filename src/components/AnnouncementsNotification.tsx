
import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, Megaphone, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_by: string;
};

const AnnouncementsNotification = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();

    // Subscribe to realtime updates for announcements
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          filter: 'is_active=eq.true'
        },
        (payload) => {
          // Add the new announcement to state
          setAnnouncements(prevAnnouncements => {
            const newAnnouncement = payload.new as Announcement;
            // Only show notification for newly created announcements
            toast({
              title: "New Announcement",
              description: newAnnouncement.title,
            });
            setNotificationCount(prev => prev + 1);
            return [newAnnouncement, ...prevAnnouncements];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setAnnouncements(data as Announcement[]);
        setNotificationCount(data.length);
      }
    } catch (error: any) {
      console.error('Error fetching announcements:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  const handleToggleNotification = () => {
    setShowNotification(!showNotification);
    // Reset notification counter when opening
    if (!showNotification) {
      setNotificationCount(0);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Info className="h-4 w-4 text-amber-500" />;
      case 'normal':
      default:
        return <Megaphone className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleToggleNotification}
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </Button>

      {showNotification && (
        <Card className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border-2 border-gray-200 dark:border-gray-700 max-w-[95vw]">
          <div className="flex justify-between items-center p-3 bg-mess-100 dark:bg-mess-900 rounded-t-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-mess-600" />
              Announcements
            </h3>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading announcements...
              </div>
            ) : announcements.length > 0 ? (
              <div className="p-2">
                {announcements.map((announcement, index) => (
                  <div key={announcement.id} className="mb-2 last:mb-0">
                    <div className={`p-3 rounded-lg ${
                      announcement.priority === 'urgent' ? 'bg-red-50 dark:bg-red-900/20' :
                      announcement.priority === 'important' ? 'bg-amber-50 dark:bg-amber-900/20' :
                      'bg-blue-50 dark:bg-blue-900/20'
                    } mb-1`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center">
                          {getPriorityIcon(announcement.priority)}
                          <span className="ml-1 text-xs capitalize font-medium text-gray-500 dark:text-gray-400">
                            {announcement.priority}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(announcement.created_at)}
                        </span>
                      </div>
                      <h4 className="font-medium text-base mb-1">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{announcement.content}</p>
                    </div>
                    {index < announcements.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No announcements available
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default AnnouncementsNotification;
