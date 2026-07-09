import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Map, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  ExternalLink, 
  PlayCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const RoadmapPage = () => {
  const { resumeId, roleId } = useParams();
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState({});

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        let response;
        if (resumeId && roleId) {
          response = await api.get(`/api/roadmap/resume/${resumeId}/role/${roleId}`);
        } else {
          // Fallback to get latest generated roadmap
          const listRes = await api.get('/api/roadmap/user/me');
          if (listRes.data.length > 0) {
            response = { data: listRes.data[0] };
          } else {
            response = { data: null };
          }
        }
        setRoadmap(response.data);
        
        // Expand first week by default
        if (response.data && response.data.roadmap_data?.schedule) {
          const firstWeek = Object.keys(response.data.roadmap_data.schedule)[0];
          if (firstWeek) {
            setExpandedWeeks({ [firstWeek]: true });
          }
        }
      } catch (err) {
        console.error("Error loading roadmap", err);
        setErrorMsg("Failed to retrieve learning roadmap.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoadmap();
  }, [resumeId, roleId]);

  const toggleExpand = (weekKey) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-neonCyan"></div>
      </div>
    );
  }

  if (errorMsg || !roadmap) {
    return (
      <div className="glass-panel p-8 rounded-xl border border-slate-800 max-w-lg mx-auto text-center space-y-4">
        <Map className="w-12 h-12 text-brand-neonCyan mx-auto" />
        <h2 className="text-xl font-bold text-white">No Roadmap Found</h2>
        <p className="text-sm text-slate-400">
          You haven't run any skill gap audit yet, or are querying an invalid profile. Please return to the dashboard and evaluate your resume against a target role to dynamically generate a customized learning roadmap.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-neonCyan text-brand-navy font-bold rounded-lg text-xs hover:bg-brand-neonCyan/85 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { roadmap_data } = roadmap;
  const schedule = roadmap_data.schedule || {};

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header title block */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Map className="text-brand-neonCyan w-8 h-8" />
          <span>Personalized Learning Roadmap</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Weekly study roadmap and custom assignments tailored for: <span className="font-bold text-brand-neonCyan">{roadmap_data.job_role}</span>.
        </p>
      </div>

      {/* Week Timeline Schedule items */}
      <div className="relative border-l border-slate-800 ml-4 space-y-6">
        {Object.keys(schedule).map((weekKey, index) => {
          const info = schedule[weekKey];
          const isExpanded = !!expandedWeeks[weekKey];
          
          return (
            <div key={weekKey} className="relative pl-8">
              
              {/* Timeline bubble node circle */}
              <div className={`absolute -left-3.5 top-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                isExpanded 
                  ? 'bg-brand-neonCyan text-brand-navy border-brand-neonCyan shadow-neon' 
                  : 'bg-brand-dark text-slate-400 border-slate-800'
              }`}>
                {index + 1}
              </div>

              {/* Collapsible Card */}
              <div className="glass-panel rounded-xl border border-slate-850 overflow-hidden transition-all duration-300">
                
                {/* Expand Toggle Trigger header */}
                <button
                  onClick={() => toggleExpand(weekKey)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-800/10 cursor-pointer outline-none"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-neonCyan">
                      {weekKey}
                    </span>
                    <h3 className="text-md font-extrabold text-white mt-0.5">
                      {info.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-brand-slate/60 text-slate-400 border border-slate-800 rounded">
                      {info.focus}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Collapsible detail content wrapper */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-850 bg-slate-900/10 space-y-5 animate-fadeIn">
                    
                    {/* Key syllabus topics list */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-brand-teal" />
                        <span>Core Syllabus Topics</span>
                      </h4>
                      <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1.5">
                        {info.topics.map((t, idx) => (
                          <li key={idx} className="leading-relaxed">{t}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Practice Lab details */}
                    <div className="p-4 bg-brand-slate/40 rounded-lg border border-slate-850 space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <PlayCircle className="w-4 h-4 text-brand-indigo" />
                        <span>Hands-On Assignment Lab</span>
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed pl-5">
                        {info.lab}
                      </p>
                    </div>

                    {/* Learning resources */}
                    {info.resource && (
                      <div className="pt-2">
                        <a
                          href={info.resource}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-neonCyan hover:underline"
                        >
                          <span>Access Curated Video Lectures</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapPage;
