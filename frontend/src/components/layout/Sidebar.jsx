import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, BarChart2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden md:flex w-64 flex-col bg-muted/30 border-r border-border p-4 h-full">
      <div className="font-bold text-xl mb-6 px-2 text-primary">MindTrace.ai</div>
      
      <nav className="flex flex-col gap-2">
        <NavLink 
          to="/chat" 
          className={({ isActive }) => cn(
            "px-4 py-2 flex items-center gap-3 rounded-md font-medium text-sm transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare size={18} />
          New Chat
        </NavLink>
        
        <NavLink 
          to="/wrap" 
          className={({ isActive }) => cn(
            "px-4 py-2 flex items-center gap-3 rounded-md font-medium text-sm transition-colors mt-2",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart2 size={18} />
          Mental Wrap
        </NavLink>
      </nav>
      
      <div className="mt-auto pt-6 flex flex-col gap-4">
        {user && <div className="px-2 text-xs text-muted-foreground truncate border-t border-border pt-4">Authed as: {user.email}</div>}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
};
