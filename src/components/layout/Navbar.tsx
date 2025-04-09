
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Clock, LogOut, Menu, User, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Food Menu', path: '/menu' },
    { name: 'Book Meal', path: '/book-meal' },
    { name: 'Feedback', path: '/feedback' },
    { name: 'Complaints', path: '/complaints' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-mess-600">HostelChow</span>
            </Link>
          </div>

          {/* Current time display */}
          <div className="hidden md:flex items-center bg-mess-100 rounded-full px-4 py-1">
            <Clock className="h-4 w-4 text-mess-600 mr-2" />
            <span className="text-sm text-mess-700">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </span>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-4">
            {user && navItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className="text-gray-600 hover:text-mess-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-gray-500">Room: {user.roomNumber}</DropdownMenuLabel>
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-2 px-4 shadow-lg">
          <div className="flex items-center bg-mess-100 rounded-full px-4 py-1 mb-4">
            <Clock className="h-4 w-4 text-mess-600 mr-2" />
            <span className="text-sm text-mess-700">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </span>
          </div>
          
          {user ? (
            <>
              <div className="border-b pb-3 mb-3">
                <p className="text-mess-600 font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">Room: {user.roomNumber}</p>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-mess-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="mt-3 w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50"
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
