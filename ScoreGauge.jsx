import React from 'react';

const ScoreGauge = ({ score = 0, size = 160 }) => {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color matching score range
  const getGradientColors = () => {
    if (score < 50) return { from: '#EF4444', to: '#F97316' }; // Red -> Orange
    if (score < 80) return { from: '#EAB308', to: '#10B981' }; // Yellow -> Green
    return { from: '#06B6D4', to: '#6366F1' }; // Cyan -> Indigo (Glow)
  };

  const colors = getGradientColors();

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={`gaugeGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background track circle */}
        <circle
          stroke="rgba(30, 41, 59, 0.5)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Fill colored track circle */}
        <circle
          stroke={`url(#gaugeGradient-${score})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          filter="url(#glow)"
        />
      </svg>
      
      {/* Centered Score Label text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
          {score}%
        </span>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Match Rate
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;
