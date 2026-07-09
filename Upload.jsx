import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, TrendingUp, AlertTriangle, Lightbulb, Target } from 'lucide-react';

const UploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [qualityResult, setQualityResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setErrorMsg("Unsupported format. Only PDF and DOCX files are allowed.");
      return false;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setErrorMsg("File size exceeds 10MB limit.");
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setErrorMsg('');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a file to upload.");
      return;
    }
    
    setUploading(true);
    setErrorMsg('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResumeId(response.data.id);
      // Auto-run quality check after upload
      await performQualityCheck(response.data.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Upload failed. Please verify your file or try again.");
    } finally {
      setUploading(false);
    }
  };

  const performQualityCheck = async (resumeId) => {
    setAnalyzing(true);
    try {
      const response = await api.post(`/api/analyze/quick-quality-check/${resumeId}`);
      setQualityResult(response.data);
    } catch (err) {
      console.error('Quality check failed:', err);
      setErrorMsg("Quality check failed, but your resume was uploaded successfully.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getRatingColor = (rating) => {
    switch(rating) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      case 'Average': return 'text-yellow-400';
      case 'Poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getRatingBgColor = (rating) => {
    switch(rating) {
      case 'Excellent': return 'bg-green-950/40 border-green-500/35';
      case 'Good': return 'bg-blue-950/40 border-blue-500/35';
      case 'Average': return 'bg-yellow-950/40 border-yellow-500/35';
      case 'Poor': return 'bg-red-950/40 border-red-500/35';
      default: return 'bg-slate-900/40 border-slate-500/35';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn py-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Your Resume</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Upload your resume in PDF or Word (.docx) format and get instant quality assessment
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-glass">
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-500/35 text-red-200 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success && qualityResult ? (
          <div className="py-8 space-y-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-brand-teal mx-auto animate-bounce" />
              <h2 className="text-xl font-bold text-white">Upload Successful!</h2>
              <p className="text-sm text-slate-400">Your resume has been analyzed. See details below.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 relative ${
                isDragActive 
                  ? 'border-brand-neonCyan bg-brand-neonCyan/5' 
                  : file 
                    ? 'border-brand-indigo/50 bg-brand-indigo/5' 
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/10'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading || analyzing}
                accept=".pdf,.docx"
              />

              {file ? (
                <div className="space-y-3">
                  <FileText className="w-12 h-12 text-brand-neonCyan mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-white max-w-xs mx-auto truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <span className="inline-block text-xs font-semibold text-brand-neonCyan/70 bg-brand-neonCyan/10 px-2.5 py-1 rounded">
                    Change File
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/40 rounded-full inline-block">
                    <Upload className="w-8 h-8 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Drag & Drop your resume here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      or click to browse local files (PDF, DOCX)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {file && (
              <button
                type="submit"
                disabled={uploading || analyzing}
                className="w-full py-2.5 px-4 bg-brand-neonCyan hover:bg-brand-neonCyan/85 text-brand-navy font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {uploading || analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploading ? 'Extracting Skills & Formatting...' : 'Analyzing Quality...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Process & Upload Resume</span>
                  </>
                )}
              </button>
            )}

            <div className="pt-4 border-t border-slate-850 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>Maximum file size: 10MB</span>
              <span>Supported formats: .pdf, .docx</span>
            </div>

          </form>
        )}
      </div>

      {/* Quality Assessment Results */}
      {qualityResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quality Score Card */}
          <div className={`glass-panel p-8 rounded-2xl border ${getRatingBgColor(qualityResult.quality_rating)} shadow-glass`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Resume Quality Rating</h3>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className={`text-4xl font-bold ${getRatingColor(qualityResult.quality_rating)}`}>
                    {qualityResult.quality_rating}
                  </span>
                  <span className="text-xl font-semibold text-slate-300">
                    {qualityResult.quality_score}/{qualityResult.max_score}
                  </span>
                </div>
              </div>
              <TrendingUp className={`w-16 h-16 ${getRatingColor(qualityResult.quality_rating)} opacity-20`} />
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  qualityResult.quality_rating === 'Excellent' ? 'bg-green-500' :
                  qualityResult.quality_rating === 'Good' ? 'bg-blue-500' :
                  qualityResult.quality_rating === 'Average' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(qualityResult.quality_score / qualityResult.max_score) * 100}%` }}
              />
            </div>
          </div>

          {/* Strengths Section */}
          {qualityResult.strengths && qualityResult.strengths.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-green-500/20 border-slate-800 shadow-glass">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <h4 className="text-lg font-semibold text-white">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {qualityResult.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-green-400 font-bold mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues Section */}
          {qualityResult.issues && qualityResult.issues.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-red-500/20 border-slate-800 shadow-glass">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <h4 className="text-lg font-semibold text-white">Issues to Address</h4>
              </div>
              <ul className="space-y-2">
                {qualityResult.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-1">!</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions Section */}
          {qualityResult.suggestions && qualityResult.suggestions.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-brand-neonCyan/20 border-slate-800 shadow-glass">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-brand-neonCyan flex-shrink-0" />
                <h4 className="text-lg font-semibold text-white">Improvement Suggestions</h4>
              </div>
              <ul className="space-y-2">
                {qualityResult.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-brand-neonCyan font-bold mt-1">→</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company Alignment Section */}
          {qualityResult.company_alignment && (
            <div className="glass-panel p-6 rounded-2xl border border-brand-indigo/20 border-slate-800 shadow-glass">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-brand-indigo flex-shrink-0" />
                <h4 className="text-lg font-semibold text-white">Company Alignment</h4>
              </div>
              
              <div className="space-y-4">
                {/* Company Types */}
                <div>
                  <h5 className="text-sm font-semibold text-slate-300 mb-3">Best Fit For:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qualityResult.company_alignment.company_types.map((company, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <p className="font-semibold text-white text-sm">{company.type}</p>
                        <p className="text-xs text-slate-400 mt-1">{company.note}</p>
                        <p className={`text-xs font-bold mt-2 ${
                          company.match === 'High' ? 'text-green-400' : 
                          company.match === 'Medium' ? 'text-yellow-400' :
                          'text-slate-400'
                        }`}>
                          Match: {company.match}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cloud Provider */}
                {qualityResult.company_alignment.primary_cloud_provider && (
                  <div>
                    <h5 className="text-sm font-semibold text-slate-300 mb-2">Primary Cloud Provider:</h5>
                    <p className="text-sm text-brand-neonCyan font-semibold bg-brand-neonCyan/10 px-3 py-2 rounded inline-block">
                      {qualityResult.company_alignment.primary_cloud_provider}
                    </p>
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-brand-indigo/10 border border-brand-indigo/30 p-3 rounded-lg">
                  <p className="text-sm text-slate-300">{qualityResult.company_alignment.quality_recommendation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-brand-neonCyan hover:bg-brand-neonCyan/85 text-brand-navy font-bold rounded-lg text-sm transition-all"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setFile(null);
                setQualityResult(null);
                setSuccess(false);
              }}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-sm transition-all"
            >
              Upload Another Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
