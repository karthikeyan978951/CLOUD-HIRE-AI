import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, Lock, Mail, Loader2, UserPlus } from 'lucide-react';

const MAX_PASSWORD_LENGTH = 72;

const getErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (err.response?.data?.detail) return err.response.data.detail;
  if (err.response?.data?.message) return err.response.data.message;
  if (typeof err.response?.data === 'string') return err.response.data;
  if (err.message) return err.message;
  return fallback;
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMessage('');

    if (!email.trim()) {
      setErrMessage('Please enter your email address.');
      return;
    }

    if (password !== confirmPassword) {
      setErrMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      setErrMessage(`Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`);
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setErrMessage(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-indigo/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-neonCyan/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-brand-neonCyan to-brand-indigo rounded-2xl shadow-neon mb-3 glow-pulse">
            <Cloud className="w-8 h-8 text-brand-navy" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            CloudHire <span className="text-brand-neonCyan">AI</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Cloud Resume Skill Validator</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 shadow-glass">
          <h2 className="text-xl font-bold text-white mb-6">Create Account</h2>

          {errMessage && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/35 text-red-200 text-xs rounded-lg">
              {errMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-navy/60 border border-slate-800 focus:border-brand-neonCyan rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-navy/60 border border-slate-800 focus:border-brand-neonCyan rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-brand-navy/60 border border-slate-800 focus:border-brand-neonCyan rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-indigo to-brand-neonCyan hover:from-brand-indigo hover:to-brand-indigo text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-neon-violet hover:shadow-neon duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-neonCyan hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
