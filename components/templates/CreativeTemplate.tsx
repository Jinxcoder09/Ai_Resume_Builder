import React from 'react';
import type { ResumeData } from '../../types';
import { Highlight } from '../Highlight';

interface CreativeTemplateProps {
    resumeData: ResumeData;
    sectionOrder: (keyof ResumeData)[];
    keywords: string[];
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-6">
        <h2 className="text-xl font-bold text-teal tracking-wide mb-3">{title}</h2>
        <div className="text-sm text-gray-700">
            {children}
        </div>
    </section>
);

export const CreativeTemplate = React.forwardRef<HTMLDivElement, CreativeTemplateProps>(({ resumeData, sectionOrder, keywords }, ref) => {
    const { personalDetails, summary, experience, education, skills, projects, otherSections } = resumeData;

    const sections: { [key in keyof Omit<ResumeData, 'personalDetails'>]?: React.ReactNode } = {
        summary: summary ? (
            <Section key="summary" title="About Me">
                <p className="whitespace-pre-wrap italic"><Highlight text={summary} keywords={keywords} /></p>
            </Section>
        ) : null,
        skills: skills.length > 0 && skills[0] !== "" ? (
            <Section key="skills" title="Toolkit">
                 <div className="flex flex-wrap gap-2">
                  {skills.map((keyword, i) => (
                    <span key={i} className="bg-secondary text-light text-xs font-medium px-3 py-1 rounded-full">
                      <Highlight text={keyword} keywords={keywords} />
                    </span>
                  ))}
                </div>
            </Section>
        ) : null,
        experience: experience.length > 0 && experience[0]?.jobTitle ? (
            <Section key="experience" title="Experience">
                {experience.map(exp => (
                    <div key={exp.id} className="mb-4 relative pl-5">
                        <div className="absolute left-0 top-1.5 w-2 h-2 bg-teal rounded-full"></div>
                        <h3 className="font-semibold text-gray-900 text-md"><Highlight text={exp.jobTitle || "Job Title"} keywords={keywords} /></h3>
                        <p className="italic text-gray-700"><Highlight text={exp.company || "Company"} keywords={keywords} /> | {exp.dates || "Dates"}</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                            {exp.responsibilities.map((resp, i) => resp && <li key={i}><Highlight text={resp} keywords={keywords} /></li>)}
                        </ul>
                    </div>
                ))}
            </Section>
        ) : null,
        projects: projects.length > 0 && projects[0]?.name ? (
             <Section key="projects" title="Projects">
                {projects.map(proj => (
                    <div key={proj.id} className="mb-4 relative pl-5">
                        <div className="absolute left-0 top-1.5 w-2 h-2 bg-teal rounded-full"></div>
                        <h3 className="font-semibold text-gray-900">
                            <Highlight text={proj.name || "Project Name"} keywords={keywords} />
                            {proj.link && (
                                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 font-normal text-sm">
                                    [Live Demo]
                                </a>
                            )}
                        </h3>
                        <p className="text-sm mt-1"><Highlight text={proj.description} keywords={keywords} /></p>
                    </div>
                ))}
            </Section>
        ) : null,
        education: education.length > 0 && education[0]?.degree ? (
            <Section key="education" title="Education">
                {education.map(edu => (
                    <div key={edu.id} className="mb-2">
                       <h3 className="font-semibold text-gray-900"><Highlight text={edu.degree || "Degree"} keywords={keywords} /></h3>
                       <p className="italic text-gray-700"><Highlight text={edu.institution || "Institution"} keywords={keywords} /> ({edu.dates || "Dates"})</p>
                    </div>
                ))}
            </Section>
        ) : null,
        otherSections: otherSections?.length > 0 ? (
             <div key="otherSections">
                {otherSections.map(section => section.title && section.content && (
                    <Section key={section.id} title={section.title}>
                        <p className="whitespace-pre-wrap"><Highlight text={section.content} keywords={keywords} /></p>
                    </Section>
                ))}
            </div>
        ) : null,
    };

    return (
        <div ref={ref} className="p-8 bg-white text-gray-800 shadow-lg rounded-lg font-['Inter',sans-serif] min-h-[29.7cm]">
            <header className="mb-8">
                <h1 className="text-5xl font-extrabold text-secondary tracking-tighter">{personalDetails.fullName || "Your Name"}</h1>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2 border-t-2 border-teal pt-2">
                    {personalDetails.email && <span>{personalDetails.email}</span>}
                    {personalDetails.phone && <span className="whitespace-nowrap">{personalDetails.phone}</span>}
                    {personalDetails.location && <span className="whitespace-nowrap">{personalDetails.location}</span>}
                    {personalDetails.linkedin && <span className="whitespace-nowrap"><a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></span>}
                    {personalDetails.website && <span className="whitespace-nowrap"><a href={personalDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a></span>}
                </div>
            </header>
            
            {sectionOrder.map(key => {
                if (key === 'personalDetails') return null;
                return sections[key as keyof typeof sections] || null;
            })}
        </div>
    );
});
