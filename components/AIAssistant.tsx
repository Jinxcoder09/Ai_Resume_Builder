import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { CopyIcon } from './icons/CopyIcon';

interface AIAssistantProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onRewriteSummary: () => Promise<void>;
  isRewriting: boolean;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const scoreColor = score > 80 ? 'text-teal' : score > 60 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
                <circle className="text-accent" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="72" cy="72" />
                <circle
                    className={`${scoreColor.replace('text-', 'stroke-')}`} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="72" cy="72" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <span className={`absolute text-4xl font-bold ${scoreColor}`}>
                {score}
            </span>
        </div>
    );
};

export const AIAssistant: React.FC<AIAssistantProps> = ({ analysis, loading, error, jobDescription, setJobDescription, onRewriteSummary, isRewriting }) => {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };
  
  return (
    <div className="sticky top-0 h-screen overflow-y-auto bg-secondary p-6 rounded-l-lg shadow-2xl flex flex-col space-y-6">
      <div className="flex items-center space-x-2 text-2xl font-bold">
        <SparklesIcon />
        <h2>AI Assistant</h2>
      </div>

      <div>
        <label htmlFor="job-description" className="block text-sm font-medium text-highlight mb-1">
          Target Job Description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to get a score and suggestions..."
          className="w-full h-32 p-2 bg-primary border border-accent rounded-md focus:ring-teal focus:border-teal transition"
        />
      </div>

      <div className="flex-grow flex items-center justify-center">
        {loading && <div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal mx-auto"></div><p className="mt-4">Analyzing...</p></div>}
        {error && <p className="text-red-400 text-center">Error: {error}</p>}
        {!loading && !error && analysis && (
          <div className="w-full text-center space-y-6">
            <h3 className="text-xl font-semibold">Resume Score</h3>
            <div className="flex justify-center">
              <ScoreCircle score={analysis.score} />
            </div>
            <div className="text-left space-y-4">
              <div>
                <h4 className="font-semibold text-teal">Strengths</h4>
                <p className="text-sm text-highlight">{analysis.strengths}</p>
              </div>
              <div>
                 <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-yellow-400">Areas for Improvement</h4>
                     <button 
                        onClick={onRewriteSummary} 
                        disabled={isRewriting}
                        className="flex items-center gap-1 text-sm text-teal hover:text-teal/80 disabled:opacity-50 transition"
                    >
                        {isRewriting ? (
                           <div className="w-4 h-4 border-2 border-accent border-t-teal rounded-full animate-spin"></div>
                        ) : (
                           <SparklesIcon/>
                        )}
                        Rewrite Summary
                    </button>
                </div>
                <div className="mt-2 space-y-3">
                  {analysis.improvementSuggestions.map((suggestion, i) => (
                    <div key={i} className="text-sm bg-primary/50 p-3 rounded-lg">
                      <p className="font-semibold text-light">{suggestion.point}</p>
                      <p className="text-highlight italic mt-1">e.g., "{suggestion.example}"</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-teal">Keyword Suggestions</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.keywordSuggestions.map((keyword, i) => (
                    <div key={i} className="relative">
                      <button onClick={() => handleCopyKeyword(keyword)} className="flex items-center gap-1.5 bg-accent text-light text-xs font-medium pl-2.5 pr-2 py-1 rounded-full hover:bg-highlight transition">
                        <span>{keyword}</span>
                        <CopyIcon />
                      </button>
                      {copiedKeyword === keyword && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-teal text-primary text-xs font-bold px-2 py-0.5 rounded-md">
                          Copied!
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {!loading && !error && !analysis && (
          <div className="text-center text-accent">
            <p>Your resume analysis will appear here once you add content and a job description.</p>
          </div>
        )}
      </div>
    </div>
  );
};