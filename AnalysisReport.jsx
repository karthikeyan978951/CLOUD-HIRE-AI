import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import RadarChart from '../components/RadarChart';
import { 
  FileDown, 
  ArrowLeft, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';

const AnalysisReport = () => {
  const { id } = useParams();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/api/analyze/report/${id}`);
        setReport(response.data);
      } catch (err) {
        console.error("Error loading report details", err);
        setErrorMsg("Failed to load audit report. Please verify access rights.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);

  const handleDownloadPDF = () => {
    // Standard URL redirect for StreamingResponse attachment download
    const token = localStorage.getItem('token');
    window.open(`/api/analyze/report/${id}/download?token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-neonCyan"></div>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="glass-panel p-8 rounded-xl border border-red-500/20 max-w-md mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Error Loading Report</h2>
        <p className="text-sm text-slate-400">{errorMsg || "Report details not found."}</p>
        <Link to="/" className="inline-block text-xs font-semibold text-brand-neonCyan hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { scores, gap_analysis, job_role_title, job_role_id, resume_id } = report;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none py-2 px-4 bg-brand-slate/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
          
          <Link
            to={`/roadmap/resume/${resume_id}/role/${job_role_id}`}
            className="flex-1 sm:flex-none py-2 px-4 bg-brand-neonCyan hover:bg-brand-neonCyan/85 text-brand-navy font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-neon"
          >
            <span>View Learning Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Scorecard Banner Block */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Overall Match Circle and target role details */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <ScoreGauge score={scores.overall_score} size={150} />
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">{job_role_title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Cloud Readiness Audit</p>
          </div>
        </div>

        {/* Categories breakdown metrics */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          <div className="p-4 bg-brand-slate/40 rounded-lg border border-slate-800 text-center space-y-1">
            <Layers className="w-5 h-5 text-brand-neonCyan mx-auto" />
            <p className="text-2xl font-black text-white">{scores.skill_match_score}%</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Skill Overlap</p>
          </div>

          <div className="p-4 bg-brand-slate/40 rounded-lg border border-slate-800 text-center space-y-1">
            <TrendingUp className="w-5 h-5 text-brand-violet mx-auto" />
            <p className="text-2xl font-black text-white">{scores.project_score}%</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Project Context</p>
          </div>

          <div className="p-4 bg-brand-slate/40 rounded-lg border border-slate-800 text-center space-y-1">
            <Award className="w-5 h-5 text-brand-teal mx-auto" />
            <p className="text-2xl font-black text-white">{scores.certification_score}%</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Certifications</p>
          </div>

          <div className="p-4 bg-brand-slate/40 rounded-lg border border-slate-800 text-center space-y-1">
            <BookOpen className="w-5 h-5 text-brand-indigo mx-auto" />
            <p className="text-2xl font-black text-white">{scores.experience_score}%</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Experience Years</p>
          </div>
          
        </div>
      </div>

      {/* Grid of Strength Tag Bubble grids + Radar Chart comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Strengths and Gaps lists */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-md font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-teal" />
              <span>Extracted Strength Areas</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {gap_analysis.strengths.length === 0 ? (
                <p className="text-sm text-slate-500">No primary matching cloud technologies found in text.</p>
              ) : (
                gap_analysis.strengths.map((str, index) => (
                  <span key={index} className="text-xs font-semibold text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-full">
                    {str}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-md font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brand-indigo" />
              <span>Missing Role Required Skills</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {gap_analysis.missing.length === 0 ? (
                <p className="text-sm text-brand-teal font-semibold">Outstanding! You have no missing skills for this role.</p>
              ) : (
                gap_analysis.missing.map((mis, index) => (
                  <span key={index} className="text-xs font-semibold text-brand-indigo bg-brand-indigo/10 border border-brand-indigo/20 px-3 py-1.5 rounded-full">
                    {mis}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Radar Chart component overlay */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
          <h2 className="text-md font-bold text-white mb-4">Competency Overlay Chart</h2>
          <div className="flex-1 flex items-center justify-center">
            <RadarChart candidateSkills={gap_analysis.strengths} requiredSkills={gap_analysis.strengths.concat(gap_analysis.missing)} />
          </div>
        </div>

      </div>

      {/* Complete Gap Priority Ranking table */}
      <div className="glass-panel p-6 rounded-xl border border-slate-850">
        <h2 className="text-lg font-bold text-white mb-4">Skill Gap Priority Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-brand-slate/40 text-xs text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4">Match Status</th>
                <th className="py-3 px-4">Priority Importance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {gap_analysis.details.map((item, index) => (
                <tr key={index} className="hover:bg-slate-800/10 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {item.skill}
                  </td>
                  <td className="py-3 px-4">
                    {item.status === 'Matched' ? (
                      <span className="text-xs font-bold text-brand-teal px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                        Matched
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/20 border border-red-500/20">
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {item.priority === 'High' && (
                      <span className="text-xs font-bold text-red-400">🔥 High Priority Gap</span>
                    )}
                    {item.priority === 'Medium' && (
                      <span className="text-xs font-semibold text-orange-400">⚡ Medium Priority Gap</span>
                    )}
                    {item.priority === 'Low' && (
                      <span className="text-xs text-slate-400">📈 Low Priority Gap</span>
                    )}
                    {item.priority === 'None' && (
                      <span className="text-xs text-brand-teal font-semibold">✓ Matched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
