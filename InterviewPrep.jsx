import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  GraduationCap, 
  HelpCircle, 
  HelpCircle as QuestionIcon, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

const InterviewPrep = () => {
  const [skills, setSkills] = useState(["AWS Lambda", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Python", "Amazon S3"]);
  const [selectedSkill, setSelectedSkill] = useState("AWS Lambda");
  const [difficulty, setDifficulty] = useState("All");
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    // Attempt to pull user's parsed resume skills to make the prep customized
    const fetchUserSkills = async () => {
      try {
        const resumeRes = await api.get('/api/resume/list');
        if (resumeRes.data.length > 0) {
          const latestResume = resumeRes.data[0];
          const resumeSkills = latestResume.parsed_content?.skills || [];
          if (resumeSkills.length > 0) {
            // Merge unique, filter out empty
            const combined = Array.from(new Set([...resumeSkills, ...skills]));
            setSkills(combined.filter(s => s));
            setSelectedSkill(combined[0]);
          }
        }
      } catch (e) {
        console.log("Could not customize prep skills from resume", e);
      }
    };
    fetchUserSkills();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setRevealedAnswers({});
    try {
      let url = `/api/questions/${encodeURIComponent(selectedSkill)}`;
      if (difficulty !== "All") {
        url += `?difficulty=${difficulty}`;
      }
      const response = await api.get(url);
      setQuestions(response.data);
    } catch (err) {
      console.error("Error loading interview questions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSkill, difficulty]);

  const toggleRevealAnswer = (id) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Page header title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <GraduationCap className="text-brand-neonCyan w-8 h-8" />
          <span>Interview Preparation Flashcards</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Test your cloud knowledge. Select a cloud skill and toggle the difficulty level to practice.
        </p>
      </div>

      {/* Selectors Panel controls */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Skill Selector */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-brand-neonCyan" />
            <span>Select Skill</span>
          </span>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full sm:w-56 bg-brand-navy border border-slate-800 focus:border-brand-neonCyan text-slate-200 rounded-lg p-2 text-sm outline-none cursor-pointer"
          >
            {skills.map((skill, idx) => (
              <option key={idx} value={skill} className="bg-brand-navy">
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Selector */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-brand-violet" />
            <span>Difficulty Level</span>
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            {["All", "Easy", "Medium", "Hard"].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 sm:flex-none text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-all border ${
                  difficulty === level
                    ? 'bg-brand-neonCyan text-brand-navy border-brand-neonCyan shadow-neon'
                    : 'bg-brand-navy border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Cards list loader */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-neonCyan"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="glass-panel p-12 rounded-xl text-center text-slate-500 border border-slate-850">
              <QuestionIcon className="w-12 h-12 text-slate-700 mx-auto mb-2" />
              <p className="text-sm">No preseeded questions found matching selection.</p>
            </div>
          ) : (
            questions.map((q) => {
              const revealed = !!revealedAnswers[q.id];
              return (
                <div 
                  key={q.id} 
                  className={`glass-panel border rounded-xl overflow-hidden transition-all duration-300 ${
                    revealed ? 'border-brand-neonCyan/30' : 'border-slate-850'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      
                      {/* Difficulty Label tag */}
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        q.difficulty === 'Easy' 
                          ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20' 
                          : q.difficulty === 'Medium' 
                            ? 'bg-orange-400/10 text-orange-400 border border-orange-400/20' 
                            : 'bg-red-400/10 text-red-400 border border-red-400/20'
                      }`}>
                        {q.difficulty}
                      </span>
                      
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        Topic: {q.skill_name}
                      </span>
                    </div>

                    {/* Question Header text */}
                    <h3 className="text-md font-bold text-white mt-3 leading-relaxed">
                      {q.question}
                    </h3>

                    {/* Reveal Button trigger */}
                    <button
                      onClick={() => toggleRevealAnswer(q.id)}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-neonCyan hover:underline cursor-pointer outline-none"
                    >
                      {revealed ? (
                        <>
                          <span>Hide Suggested Answer</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Reveal Suggested Answer</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Suggested Answer detailed body */}
                    {revealed && (
                      <div className="mt-4 pt-4 border-t border-slate-850 text-sm text-slate-300 leading-relaxed bg-brand-dark/20 p-4 rounded-lg border border-slate-850 animate-fadeIn">
                        {q.answer}
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
