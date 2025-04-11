import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  User,
  Settings as SettingsIcon,
  HelpCircle,
  FileText,
  MessageSquare,
  Calendar,
  Home,
  Moon,
  Sun,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDarkMode = user?.theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isAdmin = user?.email?.includes('admin');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-4 w-4 mr-2" /> },
    { name: 'Food Menu', path: '/menu', icon: <FileText className="h-4 w-4 mr-2" /> },
    { name: 'Book Meal', path: '/book-meal', icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: 'Feedback', path: '/feedback', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { name: 'Complaints', path: '/complaints', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { name: 'Help Desk', path: '/help-desk', icon: <HelpCircle className="h-4 w-4 mr-2" /> },
    ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin', icon: <Shield className="h-4 w-4 mr-2" /> }] : []),
  ];

  return (
    <nav className="bg-white dark:bg-mess-black shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-mess-700 dark:text-mess-300">HostelChow</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center bg-mess-100 dark:bg-mess-900 rounded-full px-4 py-1">
            <Clock className="h-4 w-4 text-mess-600 dark:text-mess-400 mr-2" />
            <span className="text-sm text-mess-700 dark:text-mess-300">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </span>
          </div>

          <div className="hidden md:flex space-x-4">
            {user && navItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium
                  ${location.pathname === item.path 
                    ? 'text-mess-700 dark:text-mess-300 bg-mess-100 dark:bg-mess-900' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-mess-600 dark:hover:text-mess-400 hover:bg-mess-50 dark:hover:bg-mess-900/50'}
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || ''} alt={user.name} />
                      <AvatarFallback className="bg-mess-600 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme}>
                    {isDarkMode ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button>Sign in</Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-mess-black-light py-2 px-4 shadow-lg">
          <div className="flex items-center bg-mess-100 dark:bg-mess-900 rounded-full px-4 py-1 mb-4">
            <Clock className="h-4 w-4 text-mess-600 dark:text-mess-400 mr-2" />
            <span className="text-sm text-mess-700 dark:text-mess-300">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </span>
          </div>
          
          {user ? (
            <>
              <div className="border-b pb-3 mb-3 flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar || ''} alt={user.name} />
                  <AvatarFallback className="bg-mess-600 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-mess-600 dark:text-mess-400 font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Room: {user.roomNumber}</p>
                </div>
              </div>
              
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center block px-3 py-2 rounded-md text-base font-medium 
                    ${location.pathname === item.path 
                      ? 'text-mess-700 dark:text-mess-300 bg-mess-100 dark:bg-mess-900' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-mess-600 dark:hover:text-mess-400 hover:bg-mess-50 dark:hover:bg-mess-900/50'}
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t mt-3 pt-3">
                <Link
                  to="/profile"
                  className="flex items-center block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-mess-600 dark:hover:text-mess-400 hover:bg-mess-50 dark:hover:bg-mess-900/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-mess-600 dark:hover:text-mess-400 hover:bg-mess-50 dark:hover:bg-mess-900/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-mess-600 dark:hover:text-mess-400 hover:bg-mess-50 dark:hover:bg-mess-900/50"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="mt-3 w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login">
              <Button className="w-full">Sign in</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
