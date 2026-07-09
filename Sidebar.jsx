import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileUp, 
  Map, 
  GraduationCap, 
  MessageSquare, 
  TrendingUp, 
  User as UserIcon, 
  ShieldAlert,
  Menu
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload Resume', icon: FileUp },
    { to: '/roadmap', label: 'Learning Roadmap', icon: Map },
    { to: '/prep', label: 'Interview Prep', icon: GraduationCap },
    { to: '/chat', label: 'Career Chatbot', icon: MessageSquare },
    { to: '/trends', label: 'Job Trends', icon: TrendingUp },
    { to: '/profile', label: 'My Profile', icon: UserIcon },
  ];

  if (isAdmin) {
    links.push({ to: '/admin', label: 'Admin Console', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-brand-navy border-r border-slate-800 flex flex-col justify-between py-6 h-[calc(100vh-73px)] sticky top-[73px]">
      <div className="px-4 space-y-1">
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-3 mb-4">
          Navigation
        </p>
        
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-indigo/30 to-brand-neonCyan/15 text-brand-neonCyan border-l-4 border-brand-neonCyan pl-3' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
      
      <div className="px-6 pt-4 border-t border-slate-800">
        <div className="p-3 bg-brand-slate/40 rounded-lg text-center border border-slate-800">
          <p className="text-xs text-slate-400">Need Guidance?</p>
          <NavLink to="/chat" className="text-xs font-semibold text-brand-neonCyan hover:underline block mt-1">
            Talk to AI Coach
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
