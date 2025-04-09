
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-mess-black shadow-inner pt-6 pb-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-mess-600 dark:text-mess-400">HostelChow</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Making hostel mess management easier</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-mess-600 dark:hover:text-mess-400">Home</Link>
            <Link to="/menu" className="text-gray-600 dark:text-gray-400 hover:text-mess-600 dark:hover:text-mess-400">Menu</Link>
            <Link to="/feedback" className="text-gray-600 dark:text-gray-400 hover:text-mess-600 dark:hover:text-mess-400">Feedback</Link>
            <Link to="/complaints" className="text-gray-600 dark:text-gray-400 hover:text-mess-600 dark:hover:text-mess-400">Complaints</Link>
            <Link to="/help-desk" className="text-gray-600 dark:text-gray-400 hover:text-mess-600 dark:hover:text-mess-400">Help</Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
          <p>© {new Date().getFullYear()} HostelChow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
