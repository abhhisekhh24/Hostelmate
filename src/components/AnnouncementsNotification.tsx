
import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, Megaphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
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
        setAnnouncements(data);
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

  const handleNextAnnouncement = () => {
    setCurrentAnnouncementIndex(
      (prevIndex) => (prevIndex + 1) % announcements.length
    );
  };

  const handlePrevAnnouncement = () => {
    setCurrentAnnouncementIndex(
      (prevIndex) => (prevIndex - 1 + announcements.length) % announcements.length
    );
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'important':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'normal':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

      {showNotification && announcements.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Announcements</h3>
            <Button variant="ghost" size="icon" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {announcements.length > 0 ? (
              <div className="p-4">
                <div className="mb-2 flex justify-between items-center">
                  <Badge
                    variant="outline"
                    className={`${getPriorityColor(
                      announcements[currentAnnouncementIndex].priority
                    )} flex items-center gap-1`}
                  >
                    {getPriorityIcon(announcements[currentAnnouncementIndex].priority)}
                    {announcements[currentAnnouncementIndex].priority.charAt(0).toUpperCase() +
                      announcements[currentAnnouncementIndex].priority.slice(1)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(announcements[currentAnnouncementIndex].created_at)}
                  </span>
                </div>
                <h4 className="font-medium text-lg mb-2">
                  {announcements[currentAnnouncementIndex].title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {announcements[currentAnnouncementIndex].content}
                </p>
                {announcements.length > 1 && (
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevAnnouncement}
                      disabled={announcements.length <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      {currentAnnouncementIndex + 1} of {announcements.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextAnnouncement}
                      disabled={announcements.length <= 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {isLoading ? 'Loading announcements...' : 'No announcements'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsNotification;
