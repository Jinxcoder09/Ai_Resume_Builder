import React, { useRef, useState } from 'react';
import type { ResumeData, AnalysisResult } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { CompactTemplate } from './templates/CompactTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';

// TypeScript declarations for window-scoped libraries from CDN
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

type TemplateName = 'classic' | 'modern' | 'compact' | 'creative';

interface ResumePreviewProps {
    resumeData: ResumeData;
    sectionOrder: (keyof ResumeData)[];
    analysis: AnalysisResult | null;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, sectionOrder, analysis }) => {
    const resumeContentRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [template, setTemplate] = useState<TemplateName>('classic');
    const keywords = analysis?.keywordSuggestions || [];

    const handleDownloadPdf = async () => {
        const element = resumeContentRef.current;
        if (!element || !window.html2canvas || !window.jspdf) {
            alert('PDF generation library is not loaded yet. Please try again in a moment.');
            return;
        }

        setIsDownloading(true);
        // Temporarily remove highlights for PDF generation
        const highlightedElements = element.querySelectorAll('mark');
        highlightedElements.forEach(el => el.style.backgroundColor = 'transparent');
        
        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(element, {
                scale: 2, // Use a higher scale for better resolution
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const margin = 40; // 20pt margin on each side
            const contentWidth = pdfWidth - (margin * 2);

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / contentWidth;
            const contentHeight = canvasHeight / ratio;
            
            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');
            pdf.save(`${resumeData.personalDetails.fullName.replace(/ /g, '_') || 'resume'}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('An error occurred while generating the PDF. Please try again.');
        } finally {
             // Restore highlights
            highlightedElements.forEach(el => el.style.backgroundColor = '');
            setIsDownloading(false);
        }
    };

    const TemplateButton: React.FC<{ name: TemplateName; current: TemplateName; onClick: () => void; }> = ({ name, current, onClick }) => (
        <button
            onClick={onClick}
            className={`px-3 py-2 text-sm font-semibold rounded-t-lg transition-colors ${current === name ? 'bg-secondary text-teal' : 'bg-primary text-highlight hover:bg-accent'}`}
        >
            {name.charAt(0).toUpperCase() + name.slice(1)}
        </button>
    );

    const templates: { [key in TemplateName]: React.ReactNode } = {
        classic: <ClassicTemplate ref={resumeContentRef} resumeData={resumeData} sectionOrder={sectionOrder} keywords={keywords} />,
        modern: <ModernTemplate ref={resumeContentRef} resumeData={resumeData} keywords={keywords} />,
        compact: <CompactTemplate ref={resumeContentRef} resumeData={resumeData} sectionOrder={sectionOrder} keywords={keywords} />,
        creative: <CreativeTemplate ref={resumeContentRef} resumeData={resumeData} sectionOrder={sectionOrder} keywords={keywords} />
    };

    return (
        <div className="relative">
             <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    title="Download Resume as PDF"
                    aria-label="Download Resume as PDF"
                    className="bg-teal text-primary p-3 rounded-full shadow-lg hover:bg-teal/80 transition-transform transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <div className="w-5 h-5 border-2 border-primary/50 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                        <DownloadIcon />
                    )}
                </button>
            </div>
            
            <div className="flex space-x-1">
                <TemplateButton name="classic" current={template} onClick={() => setTemplate('classic')} />
                <TemplateButton name="modern" current={template} onClick={() => setTemplate('modern')} />
                <TemplateButton name="compact" current={template} onClick={() => setTemplate('compact')} />
                <TemplateButton name="creative" current={template} onClick={() => setTemplate('creative')} />
            </div>

            <div className="bg-white">
                {templates[template]}
            </div>
        </div>
    );
};
