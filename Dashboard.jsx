import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Play, 
  TrendingUp, 
  Map, 
  GraduationCap, 
  MessageSquare,
  Upload,
  Calendar,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [resumes, setResumes] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [triggeringAnalysis, setTriggeringAnalysis] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumeRes, rolesRes, reportsRes] = await Promise.all([
          api.get('/api/resume/list'),
          api.get('/api/admin/job-roles'),
          api.get('/api/analyze/list')
        ]);
        
        setResumes(resumeRes.data);
        setJobRoles(rolesRes.data);
        setReports(reportsRes.data);
        
        if (resumeRes.data.length > 0) {
          setSelectedResume(resumeRes.data[0].id.toString());
        }
        if (rolesRes.data.length > 0) {
          setSelectedRole(rolesRes.data[0].id.toString());
        }
      } catch (err) {
        console.error("Error fetching dashboard details", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    if (!selectedResume || !selectedRole) {
      setErrorMsg("Please select both a resume and a target job role.");
      return;
    }
    
    setTriggeringAnalysis(true);
    setErrorMsg('');
    
    try {
      const response = await api.post('/api/analyze', {
        resume_id: parseInt(selectedResume),
        job_role_id: parseInt(selectedRole)
      });
      navigate(`/report/${response.data.id}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "An error occurred during evaluation.");
    } finally {
      setTriggeringAnalysis(false);
    }
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
      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-brand-indigo/40 via-brand-teal/20 to-brand-navy border border-slate-800 shadow-glass">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {user?.profile?.full_name || "Cloud Engineer"}!
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
          Validate your cloud architecture and DevOps skills. Upload a resume, pick your dream role, and get your skill gap scorecard and personalized study roadmap instantly.
        </p>
      </div>

      {/* Grid of Interactive Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create Audit Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-neonCyan" />
              <span>Initiate Cloud Readiness Audit</span>
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/35 text-red-200 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            {resumes.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg space-y-4">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">No resumes found. Please upload a PDF or DOCX resume first.</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-neonCyan text-brand-navy font-bold rounded-lg text-xs hover:bg-brand-neonCyan/85 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Resume</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleStartAnalysis} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                      Select Resume
                    </label>
                    <select
                      value={selectedResume}
                      onChange={(e) => setSelectedResume(e.target.value)}
                      className="w-full bg-brand-navy/60 border border-slate-800 focus:border-brand-neonCyan text-slate-200 rounded-lg p-2.5 text-sm outline-none cursor-pointer"
                    >
                      {resumes.map(r => (
                        <option key={r.id} value={r.id} className="bg-brand-navy text-slate-200">
                          {r.filename} ({new Date(r.created_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                      Target Cloud Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-brand-navy/60 border border-slate-800 focus:border-brand-neonCyan text-slate-200 rounded-lg p-2.5 text-sm outline-none cursor-pointer"
                    >
                      {jobRoles.map(j => (
                        <option key={j.id} value={j.id} className="bg-brand-navy text-slate-200">
                          {j.title} ({j.difficulty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={triggeringAnalysis}
                  className="w-full py-2.5 px-4 bg-brand-neonCyan hover:bg-brand-neonCyan/85 text-brand-navy font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {triggeringAnalysis ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-navy border-t-transparent"></div>
                      <span>Extracting & Evaluating Gaps...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Audit & Gap Analysis</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Past Audits Logs */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4">Past Audit Evaluations</h2>
            
            {reports.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No evaluations run yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-brand-slate/40 text-xs text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Role Checked</th>
                      <th className="py-3 px-4">Date Run</th>
                      <th className="py-3 px-4">Match Score</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {report.job_role_title}
                        </td>
                        <td className="py-3 px-4 flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-brand-neonCyan">
                          {report.scores.overall_score}%
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/report/${report.id}`)}
                            className="inline-flex items-center gap-1 text-xs text-brand-neonCyan hover:underline"
                          >
                            <span>View Report</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Links & Summary Widgets */}
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800">
            <h2 className="text-md font-bold text-white mb-4">Candidate Assets</h2>
            <div className="space-y-3">
              <div className="p-3 bg-brand-slate/40 rounded-lg flex items-center justify-between border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Uploaded Resumes</span>
                <span className="text-sm font-bold text-white">{resumes.length}</span>
              </div>
              <div className="p-3 bg-brand-slate/40 rounded-lg flex items-center justify-between border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Audit Reports</span>
                <span className="text-sm font-bold text-white">{reports.length}</span>
              </div>
            </div>
            <Link
              to="/upload"
              className="mt-4 w-full py-2 px-3 border border-slate-700 hover:border-brand-neonCyan text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Resume</span>
            </Link>
          </div>

          {/* Quick Access Menu Cards */}
          <div className="grid grid-cols-1 gap-4">
            <Link to="/roadmap" className="glass-card p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-brand-indigo/35 to-transparent border border-brand-indigo/30 rounded-lg text-brand-indigo">
                <Map className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-white">Study Roadmap</h3>
                <p className="text-xs text-slate-500">Bridge skill gaps week-by-week</p>
              </div>
            </Link>

            <Link to="/prep" className="glass-card p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-brand-teal/35 to-transparent border border-brand-teal/30 rounded-lg text-brand-teal">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-white">Interview Prep</h3>
                <p className="text-xs text-slate-500">Practice questions by skill category</p>
              </div>
            </Link>

            <Link to="/chat" className="glass-card p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-brand-neonCyan/35 to-transparent border border-brand-neonCyan/30 rounded-lg text-brand-neonCyan">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-white">Career AI Coach</h3>
                <p className="text-xs text-slate-500">Interactive guidance chatbot</p>
              </div>
            </Link>

            <Link to="/trends" className="glass-card p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-brand-violet/35 to-transparent border border-brand-violet/30 rounded-lg text-brand-violet">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-white">Cloud Trends</h3>
                <p className="text-xs text-slate-500">Real-time market demands</p>
              </div>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
