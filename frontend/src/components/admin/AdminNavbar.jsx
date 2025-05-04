'use client';

import Cookie from 'js-cookie';
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, FileText, Mail, ChevronRight, LogOut, Megaphone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Startups', icon: Home },
  { name: 'EIR Requests', icon: Users },
  { name: 'Grants Requests', icon: FileText },
  { name: 'Reviewers', icon: User },  // Added 'User' icon for Reviewers
  { name: 'Messages', icon: Mail },
  { name: 'Ads', icon: Megaphone }, 
  { name: 'Logout', icon: LogOut }, 
];

export default function AdminNavbar({ selectedTab, setSelectedTab, isExpanded, setIsExpanded }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookie.remove('admin');
    navigate('/'); // Redirect after logout
  };

  return (
    <motion.div
      initial={{ width: 250 }}
      animate={{ width: isExpanded ? 250 : 80 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
      <div className="p-6 relative z-10">
        <motion.h1
          initial={{ opacity: 1 }}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200"
        >
          {isExpanded ? 'Admin Dashboard' : ''}
        </motion.h1>
      </div>
      <div className="flex justify-between p-4 relative z-10">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={24} className={!isExpanded ? '' : 'rotate-180'} />
        </motion.button>
      </div>
      <nav className="mt-8 flex-1 relative z-10">
        {navItems.map((item) => (
          <motion.button
            key={item.name}
            onClick={() => {
              if (item.name === 'Logout') {
                handleLogout();
              } else {
                setSelectedTab(item.name.toLowerCase().replace(' ', ''));
              }
            }}
            className={`w-full text-left p-4 flex items-center space-x-4 transition-all duration-300 ${
              selectedTab === item.name.toLowerCase().replace(' ', '') 
                ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                : 'hover:bg-white/10 hover:backdrop-blur-sm'
            }`}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon size={24} className={selectedTab === item.name.toLowerCase().replace(' ', '') ? 'text-purple-200' : 'text-white/80'} />
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className={`font-medium ${selectedTab === item.name.toLowerCase().replace(' ', '') ? 'text-purple-200' : 'text-white/80'}`}
            >
              {isExpanded ? item.name : ''}
            </motion.span>
          </motion.button>
        ))}
      </nav>
    </motion.div>
  );
}
