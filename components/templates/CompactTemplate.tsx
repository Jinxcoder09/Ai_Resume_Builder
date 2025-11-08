import React from 'react';
import type { ResumeData } from '../../types';
import { Highlight } from '../Highlight';

interface CompactTemplateProps {
    resumeData: ResumeData;
    sectionOrder: (keyof ResumeData)[];
    keywords: string[];
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2 text-gray-700">{title}</h2>
        <div className="text-xs text-gray-800">
            {children}
        </div>
    </section>
);

export const CompactTemplate = React.forwardRef<HTMLDivElement, CompactTemplateProps>(({ resumeData, sectionOrder, keywords }, ref) => {
    const { personalDetails, summary, experience, education, skills, projects, otherSections } = resumeData;

    const sections: { [key in keyof Omit<ResumeData, 'personalDetails'>]?: React.ReactNode } = {
        summary: summary ? (
            <Section key="summary" title="Summary">
                <p className="whitespace-pre-wrap"><Highlight text={summary} keywords={keywords} /></p>
            </Section>
        ) : null,
        skills: skills.length > 0 && skills[0] !== "" ? (
            <Section key="skills" title="Skills">
                <p>
                   {skills.map((skill, index) => (
                      <React.Fragment key={index}>
                        <Highlight text={skill} keywords={keywords} />
                        {index < skills.length - 1 && ' | '}
                      </React.Fragment>
                    ))}
                </p>
            </Section>
        ) : null,
        experience: experience.length > 0 && experience[0]?.jobTitle ? (
            <Section key="experience" title="Experience">
                {experience.map(exp => (
                    <div key={exp.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-gray-900"><Highlight text={exp.jobTitle || "Job Title"} keywords={keywords} /> at <span className="italic"><Highlight text={exp.company || "Company"} keywords={keywords} /></span></h3>
                            <p className="font-light text-gray-600">{exp.dates || "Dates"}</p>
                        </div>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {exp.responsibilities.map((resp, i) => resp && <li key={i}><Highlight text={resp} keywords={keywords} /></li>)}
                        </ul>
                    </div>
                ))}
            </Section>
        ) : null,
        projects: projects.length > 0 && projects[0]?.name ? (
             <Section key="projects" title="Projects">
                {projects.map(proj => (
                    <div key={proj.id} className="mb-3">
                         <h3 className="font-semibold text-gray-900">
                            <Highlight text={proj.name || "Project Name"} keywords={keywords} />
                            {proj.link && (
                                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 font-normal">
                                    [Link]
                                A</a>
                            )}
                        </h3>
                         {proj.technologies.length > 0 && proj.technologies[0] !== "" && (
                             <p className="italic text-gray-600 text-xs">
                                Technologies: {proj.technologies.map((tech, index) => (
                                    <React.Fragment key={index}>
                                        <Highlight text={tech} keywords={keywords} />
                                        {index < proj.technologies.length - 1 && ', '}
                                    </React.Fragment>
                                ))}
                             </p>
                         )}
                        <p className="mt-1"><Highlight text={proj.description} keywords={keywords} /></p>
                    </div>
                ))}
            </Section>
        ) : null,
        education: education.length > 0 && education[0]?.degree ? (
            <Section key="education" title="Education">
                {education.map(edu => (
                    <div key={edu.id} className="mb-2 flex justify-between">
                        <div>
                           <h3 className="font-semibold text-gray-900"><Highlight text={edu.degree || "Degree"} keywords={keywords} /></h3>
                           <p className="italic text-gray-700"><Highlight text={edu.institution || "Institution"} keywords={keywords} /></p>
                        </div>
                        <p className="font-light text-gray-600 text-right">{edu.dates || "Dates"}</p>
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
        <div ref={ref} className="p-6 bg-white text-gray-800 shadow-lg rounded-lg font-['Arial',sans-serif] min-h-[29.7cm]">
            <header className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{personalDetails.fullName || "Your Name"}</h1>
                <div className="flex justify-center items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
                    {personalDetails.location && <span>{personalDetails.location}</span>}
                    {personalDetails.email && <span className="whitespace-nowrap">| {personalDetails.email}</span>}
                    {personalDetails.phone && <span className="whitespace-nowrap">| {personalDetails.phone}</span>}
                    {personalDetails.linkedin && <span className="whitespace-nowrap">| <a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></span>}
                    {personalDetails.website && <span className="whitespace-nowrap">| <a href={personalDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a></span>}
                </div>
            </header>
            
            {sectionOrder.map(key => {
                if (key === 'personalDetails') return null;
                return sections[key as keyof typeof sections] || null;
            })}
        </div>
    );
});
