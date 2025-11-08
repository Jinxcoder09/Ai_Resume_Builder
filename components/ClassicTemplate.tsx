import React from 'react';
import type { ResumeData } from '../types';
import { Highlight } from './Highlight';

interface ClassicTemplateProps {
    resumeData: ResumeData;
    sectionOrder: (keyof ResumeData)[];
    keywords: string[];
}

export const ClassicTemplate = React.forwardRef<HTMLDivElement, ClassicTemplateProps>(({ resumeData, sectionOrder, keywords }, ref) => {
    const { personalDetails, summary, experience, education, skills, projects, otherSections } = resumeData;
    const hasContactInfo = personalDetails.email || personalDetails.phone || personalDetails.location;
    const hasLinks = personalDetails.linkedin || personalDetails.website;

    const sections: { [key in keyof Omit<ResumeData, 'personalDetails'>]?: React.ReactNode } = {
        summary: summary ? (
            <section key="summary" className="mb-6">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 text-gray-800">Summary</h2>
                <p className="text-gray-700 text-sm whitespace-pre-wrap"><Highlight text={summary} keywords={keywords} /></p>
            </section>
        ) : null,
        skills: skills.length > 0 && skills[0] !== "" ? (
            <section key="skills" className="mb-6">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 text-gray-800">Skills</h2>
                <p className="text-gray-700 text-sm">
                   {skills.map((skill, index) => (
                      <React.Fragment key={index}>
                        <Highlight text={skill} keywords={keywords} />
                        {index < skills.length - 1 && ' ・ '}
                      </React.Fragment>
                    ))}
                </p>
            </section>
        ) : null,
        experience: experience.length > 0 && experience[0]?.jobTitle ? (
            <section key="experience" className="mb-6">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 text-gray-800">Work Experience</h2>
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
            </section>
        ) : null,
        projects: projects.length > 0 && projects[0]?.name ? (
             <section key="projects" className="mb-6">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 text-gray-800">Projects</h2>
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
                                {proj.technologies.map((tech, index) => (
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
            </section>
        ) : null,
        education: education.length > 0 && education[0]?.degree ? (
            <section key="education" className="mb-6">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 text-gray-800">Education</h2>
                {education.map(edu => (
                    <div key={edu.id} className="mb-2">
                         <div className="flex justify-between items-baseline">
                            <h3 className="text-md font-semibold text-gray-900"><Highlight text={edu.degree || "Degree"} keywords={keywords} /></h3>
                            <p className="text-sm font-light text-gray-600">{edu.dates || "Dates"}</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <p className="text-md italic text-gray-700"><Highlight text={edu.institution || "Institution"} keywords={keywords} /></p>
                            <p className="text-sm font-light text-gray-600">{edu.location || "Location"}</p>
                        </div>
                    </div>
                ))}
            </section>
        ) : null,
        otherSections: otherSections?.length > 0 ? (
             <div key="otherSections">
                {otherSections.map(section => section.title && section.content && (
                    <section key={section.id} className="mb-6">
                        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 text-gray-800"><Highlight text={section.title} keywords={keywords} /></h2>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap"><Highlight text={section.content} keywords={keywords} /></p>
                    </section>
                ))}
            </div>
        ) : null,
    };

    return (
        <div ref={ref} className="p-8 bg-white text-gray-800 shadow-lg rounded-lg font-[Georgia,serif] min-h-[29.7cm]">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900">{personalDetails.fullName || "Your Name"}</h1>
                {(hasContactInfo || hasLinks) &&
                    <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                        {personalDetails.email && <span>{personalDetails.email}</span>}
                        {personalDetails.phone && <span className="whitespace-nowrap">| {personalDetails.phone}</span>}
                        {personalDetails.location && <span className="whitespace-nowrap">| {personalDetails.location}</span>}
                        {personalDetails.linkedin && <span className="whitespace-nowrap">| <a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></span>}
                        {personalDetails.website && <span className="whitespace-nowrap">| <a href={personalDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a></span>}
                    </div>
                }
            </header>
            
            {sectionOrder.map(key => {
                if (key === 'personalDetails') return null;
                return sections[key as keyof typeof sections] || null;
            })}
        </div>
    );
});
