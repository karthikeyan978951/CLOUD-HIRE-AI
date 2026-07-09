import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TrendingSkillsChart from '../components/TrendingSkillsChart';
import { 
  TrendingUp, 
  Briefcase, 
  RefreshCw, 
  ArrowUpRight, 
  Sparkles,
  Info
} from 'lucide-react';

const JobTrends = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrends = async () => {
    try {
      const response = await api.get('/api/trends');
      setTrends(response.data);
    } catch (err) {
      console.error("Error fetching market trends", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrends();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-neonCyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="text-brand-neonCyan w-8 h-8" />
            <span>Cloud Job Market Trends</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Real-time hiring volumes and skill demand percentages in cloud computing and DevOps.
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 bg-brand-slate border border-slate-700 hover:border-brand-neonCyan rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync Trends</span>
        </button>
      </div>

      {/* Main Charts & Volume Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Trending Skills Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-brand-neonCyan" />
              <span>Sought-After Technologies (2026)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Percentage of cloud job descriptions requesting these tech skill sets.
            </p>
          </div>
          
          <div className="flex-1">
            <TrendingSkillsChart trends={trends?.top_skills || []} />
          </div>
        </div>

        {/* Right Side: Role Volumes & Market Insights */}
        <div className="space-y-6">
          
          {/* Active Job Openings list */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-brand-indigo" />
              <span>National Hiring Volumes</span>
            </h2>
            
            <div className="space-y-4">
              {trends?.role_volumes.map((role, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-brand-slate/40 rounded-lg border border-slate-850 hover:border-slate-800 transition-colors">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{role.role}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Estimated monthly openings</p>
                  </div>
                  <div className="text-right flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-brand-neonCyan">
                      {role.openings.toLocaleString()}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-brand-teal" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 bg-brand-indigo/5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-neonCyan" />
              <span>Market Insight</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <b>Infrastructure as Code (IaC)</b> skills (specifically Terraform) have seen a <b>18.4%</b> year-over-year growth in demand. Recruiters are increasingly prioritizing candidates who can write provisioning files, rather than configure cloud services manually via web consoles.
            </p>
            <p className="text-[10px] text-slate-500 font-semibold italic">
              Last synced: {trends?.last_updated}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default JobTrends;
