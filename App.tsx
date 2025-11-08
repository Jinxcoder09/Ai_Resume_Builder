import React, { useState, useEffect, useCallback } from 'react';
import type { ResumeData, AnalysisResult } from './types';
import { ResumeForm } from './components/ResumeForm';
import { ResumePreview } from './components/ResumePreview';
import { AIAssistant } from './components/AIAssistant';
import { FileUpload } from './components/FileUpload';
import { HomePage } from './components/HomePage';
import { useDebounce } from './hooks/useDebounce';
import { parseResume, analyzeResume, rewriteSection } from './services/geminiService';

const emptyResume: ResumeData = {
    personalDetails: { fullName: '', email: '', phone: '', linkedin: '', website: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    otherSections: [],
};

const defaultSectionOrder: (keyof ResumeData)[] = ['personalDetails', 'summary', 'experience', 'projects', 'skills', 'education', 'otherSections'];

function App() {
    const [view, setView] = useState<'home' | 'builder'>('home');
    const [resumeData, setResumeData] = useState<ResumeData>(emptyResume);
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parsingError, setParsingError] = useState<string | null>(null);
    const [resumeLoaded, setResumeLoaded] = useState(false);
    const [sectionOrder, setSectionOrder] = useState<(keyof ResumeData)[]>(defaultSectionOrder);
    const [isRewriting, setIsRewriting] = useState(false);

    const debouncedResumeData = useDebounce(resumeData, 1000);
    const debouncedJobDescription = useDebounce(jobDescription, 1000);

    const performAnalysis = useCallback(async (data: ResumeData, jd: string) => {
        if (!jd.trim() || JSON.stringify(data) === JSON.stringify(emptyResume)) {
            setAnalysis(null);
            return;
        }
        setIsAnalyzing(true);
        setAnalysisError(null);
        try {
            const result = await analyzeResume(data, jd);
            setAnalysis(result);
        } catch (error) {
            setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    useEffect(() => {
        if (resumeLoaded) {
            performAnalysis(debouncedResumeData, debouncedJobDescription);
        }
    }, [debouncedResumeData, debouncedJobDescription, performAnalysis, resumeLoaded]);
    
    const handleParseResume = async (file: File) => {
        setIsParsing(true);
        setParsingError(null);
        try {
            const parsedData = await parseResume(file);
            // Ensure otherSections is an array, providing a fallback
            if (!parsedData.otherSections) {
                parsedData.otherSections = [];
            }
            setResumeData(parsedData);
            setResumeLoaded(true);
        } catch (error) {
            setParsingError(error instanceof Error ? error.message : "Failed to parse.");
            // We still want to show the editor even if parsing fails
            handleStartFromScratch();
        } finally {
            setIsParsing(false);
        }
    };
    
    const handleStartFromScratch = () => {
        setResumeData({
            ...emptyResume,
            experience: [{ id: crypto.randomUUID(), jobTitle: '', company: '', location: '', dates: '', responsibilities: [''] }],
            education: [{ id: crypto.randomUUID(), degree: '', institution: '', location: '', dates: '' }],
            projects: [{ id: crypto.randomUUID(), name: '', link: '', technologies: [], description: '' }],
            otherSections: [],
        });
        setResumeLoaded(true);
    };

    const handleRewriteSummary = async () => {
        if (!resumeData.summary || !jobDescription) {
            alert("Please provide a summary and a job description to use this feature.");
            return;
        }
        setIsRewriting(true);
        try {
            const rewrittenSummary = await rewriteSection('summary', resumeData.summary, resumeData, jobDescription);
            setResumeData(prev => ({ ...prev, summary: rewrittenSummary }));
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to rewrite summary.");
        } finally {
            setIsRewriting(false);
        }
    };

    if (view === 'home') {
        return <HomePage onGetStarted={() => setView('builder')} />;
    }

    if (!resumeLoaded) {
        return <FileUpload onParse={handleParseResume} onStartFromScratch={handleStartFromScratch} isParsing={isParsing} />;
    }

    return (
        <main className="grid grid-cols-1 xl:grid-cols-3 min-h-screen">
            <div className="xl:col-span-2 h-screen overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <ResumeForm 
                        resumeData={resumeData} 
                        setResumeData={setResumeData}
                        sectionOrder={sectionOrder}
                        setSectionOrder={setSectionOrder}
                        jobDescription={jobDescription}
                    />
                    <div className="bg-gray-100 p-4 h-screen overflow-y-auto">
                       <ResumePreview resumeData={resumeData} sectionOrder={sectionOrder} analysis={analysis} />
                    </div>
                </div>
            </div>
            <div className="xl:col-span-1">
                <AIAssistant 
                    analysis={analysis} 
                    loading={isAnalyzing} 
                    error={analysisError}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    onRewriteSummary={handleRewriteSummary}
                    isRewriting={isRewriting}
                />
            </div>
        </main>
    );
}

export default App;