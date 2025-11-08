import React from 'react';
import type { ResumeData } from '../types';
import { Highlight } from './Highlight';

interface ModernTemplateProps {
    resumeData: ResumeData;
    keywords: string[];
}

const Section: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <section className={`mb-6 ${className}`}>
        <h2 className="text-lg font-bold uppercase tracking-wider text-teal border-b-2 border-teal pb-1 mb-3">{title}</h2>
        {children}
    </section>
);


export const ModernTemplate = React.forwardRef<HTMLDivElement, ModernTemplateProps>(({ resumeData, keywords }, ref) => {
    const { personalDetails, summary, experience, education, skills, projects, otherSections } = resumeData;

    return (
        <div ref={ref} className="bg-white text-gray-800 shadow-lg rounded-lg flex font-['Helvetica',sans-serif] min-h-[29.7cm]">
            {/* Left Column */}
            <div className="w-1/3 bg-secondary text-light p-6 rounded-l-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white break-words">{personalDetails.fullName || "Your Name"}</h1>
                </div>

                <Section title="Contact">
                    <ul className="text-sm space-y-2 break-words">
                        {personalDetails.email && <li><Highlight text={personalDetails.email} keywords={keywords} /></li>}
                        {personalDetails.phone && <li><Highlight text={personalDetails.phone} keywords={keywords} /></li>}
                        {personalDetails.location && <li><Highlight text={personalDetails.location} keywords={keywords} /></li>}
                        {personalDetails.linkedin && <li><a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-teal">LinkedIn</a></li>}
                        {personalDetails.website && <li><a href={personalDetails.website} target="_blank" rel="noopener noreferrer" className="hover:text-teal">Portfolio</a></li>}
                    </ul>
                </Section>
                
                 {skills.length > 0 && skills[0] !== "" && (
                    <Section title="Skills">
                        <ul className="text-sm list-inside space-y-1">
                           {skills.map((skill, index) => (
                              <li key={index}><Highlight text={skill} keywords={keywords} /></li>
                            ))}
                        </ul>
                    </Section>
                 )}
                 
                 {education.length > 0 && education[0]?.degree && (
                    <Section title="Education">
                        {education.map(edu => (
                            <div key={edu.id} className="mb-4">
                               <h3 className="text-md font-semibold text-white"><Highlight text={edu.degree || "Degree"} keywords={keywords} /></h3>
                               <p className="text-sm italic text-highlight"><Highlight text={edu.institution || "Institution"} keywords={keywords} /></p>
                               <p className="text-xs text-highlight">{edu.location || 'Location'} - {edu.dates || 'Dates'}</p>
                            </div>
                        ))}
                    </Section>
                )}
            </div>

            {/* Right Column */}
            <div className="w-2/3 p-8">
                {summary && (
                    <Section title="Summary">
                        <p className="text-sm whitespace-pre-wrap"><Highlight text={summary} keywords={keywords} /></p>
                    </Section>
                )}

                {experience.length > 0 && experience[0]?.jobTitle && (
                    <Section title="Experience">
                         {experience.map(exp => (
                            <div key={exp.id} className="mb-4">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-semibold text-gray-900"><Highlight text={exp.jobTitle || "Job Title"} keywords={keywords} /></h3>
                                    <p className="text-sm font-light text-gray-600">{exp.dates || "Dates"}</p>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-md italic text-gray-700"><Highlight text={exp.company || "Company"} keywords={keywords} /></p>
                                    <p className="text-sm font-light text-gray-600">{exp.location || "Location"}</p>
                                </div>
                                <ul className="list-disc list-inside mt-1 text-sm text-gray-700 space-y-1">
                                    {exp.responsibilities.map((resp, i) => resp && <li key={i}><Highlight text={resp} keywords={keywords} /></li>)}
                                </ul>
                            </div>
                        ))}
                    </Section>
                )}

                {projects.length > 0 && projects[0]?.name && (
                    <Section title="Projects">
                        {projects.map(proj => (
                            <div key={proj.id} className="mb-4">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-md font-semibold text-gray-900">
                                        <Highlight text={proj.name || "Project Name"} keywords={keywords} />
                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 text-sm font-normal">
                                                [Link]
                                            </a>
                                        )}
                                    </h3>
                                </div>
                                {proj.technologies.length > 0 && proj.technologies[0] !== "" && (
                                     <p className="text-sm italic text-gray-600">
                                        Technologies: {proj.technologies.map((tech, index) => (
                                            <React.Fragment key={index}>
                                                <Highlight text={tech} keywords={keywords} />
                                                {index < proj.technologies.length - 1 && ', '}
                                            </React.Fragment>
                                        ))}
                                     </p>
                                 )}
                                <p className="text-sm text-gray-700 mt-1"><Highlight text={proj.description} keywords={keywords} /></p>
                            </div>
                        ))}
                    </Section>
                )}
                
                {otherSections?.length > 0 && (
                    <div>
                        {otherSections.map(section => section.title && section.content && (
                            <Section key={section.id} title={section.title}>
                                <p className="text-sm whitespace-pre-wrap"><Highlight text={section.content} keywords={keywords} /></p>
                            </Section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
