import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, BarChart2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border p-4 transition-transform duration-300 transform md:relative md:translate-x-0 md:flex md:flex-col md:bg-muted/30 h-full",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="font-bold text-xl text-primary">MindTrace.ai</div>
          {isOpen && (
             <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
               <LogOut size={18} className="rotate-180" />
             </button>
          )}
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavLink 
            to="/chat" 
            onClick={onClose}
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
            onClick={onClose}
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
    </>
  );
};
