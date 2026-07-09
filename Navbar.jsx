import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cloud, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return "?";
    if (user.profile?.full_name) {
      const parts = user.profile.full_name.split(' ');
      return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
    }
    return user.email[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-brand-navy/80 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-white hover:opacity-90">
        <div className="p-2 bg-gradient-to-tr from-brand-neonCyan to-brand-indigo rounded-lg shadow-neon">
          <Cloud className="w-6 h-6 text-brand-navy" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-neonCyan bg-clip-text text-transparent">
            CloudHire
          </span>
          <span className="text-xs font-semibold text-brand-neonCyan ml-1 px-1.5 py-0.5 rounded bg-brand-neonCyan/10 border border-brand-neonCyan/20">
            AI
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <Link to="/profile" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">
                  {user.profile?.full_name || "Cloud Candidate"}
                </p>
                <p className="text-xs text-slate-400">
                  {user.is_admin ? "Administrator" : "Job Seeker"}
                </p>
              </div>

              {user.profile?.profile_picture_url ? (
                <img
                  src={
                    user.profile.profile_picture_url.startsWith("http")
                      ? user.profile.profile_picture_url
                      : `/${user.profile.profile_picture_url}` // Handles local fallback uploads
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-brand-neonCyan/30 shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-indigo/35 text-brand-neonCyan font-bold flex items-center justify-center border border-brand-neonCyan/20">
                  {getInitials()}
                </div>
              )}
            </Link>

            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
