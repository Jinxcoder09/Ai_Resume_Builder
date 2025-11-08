import React, { useState } from 'react';
import type { ResumeData, Experience, Education, Project, OtherSection } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { generateSectionContent } from '../services/geminiService';

interface ResumeFormProps {
    resumeData: ResumeData;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
    sectionOrder: (keyof ResumeData)[];
    setSectionOrder: React.Dispatch<React.SetStateAction<(keyof ResumeData)[]>>;
    jobDescription: string;
}

const GenerateButton: React.FC<{ onClick: () => void; loading: boolean; disabled?: boolean; tooltip: string }> = ({ onClick, loading, disabled, tooltip }) => (
    <div className="relative group">
        <button
            type="button"
            onClick={onClick}
            disabled={loading || disabled}
            className="p-1 rounded-full text-teal hover:bg-teal/20 disabled:text-accent disabled:cursor-not-allowed transition-colors"
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-accent border-t-teal rounded-full animate-spin"></div>
            ) : (
                <SparklesIcon />
            )}
        </button>
        <div className="absolute bottom-full mb-2 w-max max-w-xs px-2 py-1 bg-secondary text-light text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tooltip}
        </div>
    </div>
);

const Section: React.FC<{ title: string; onGenerate?: () => void; generating?: boolean; children: React.ReactNode }> = ({ title, onGenerate, generating, children }) => (
    <fieldset className="border border-accent rounded-lg p-4 space-y-4 bg-primary transition-all">
        <legend className="px-2 font-semibold text-highlight flex items-center gap-2 select-none">
            <span className="group-active:cursor-grabbing"><DragHandleIcon /></span>
            {title}
            {onGenerate && (
                 <GenerateButton onClick={onGenerate} loading={generating || false} tooltip={`Generate ${title} with AI`} />
            )}
        </legend>
        {children}
    </fieldset>
);

const Input: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }> = ({ label, name, value, onChange, placeholder, type = "text" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-highlight mb-1">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-secondary border border-accent rounded-md p-2 focus:ring-teal focus:border-teal transition" />
    </div>
);

const Textarea: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number }> = ({ label, name, value, onChange, placeholder, rows=3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-highlight mb-1">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-secondary border border-accent rounded-md p-2 focus:ring-teal focus:border-teal transition"></textarea>
    </div>
);


export const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData, sectionOrder, setSectionOrder, jobDescription }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [generatingSection, setGeneratingSection] = useState<string | null>(null);

    const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => ({ ...prev, personalDetails: { ...prev.personalDetails, [name]: value } }));
    };
    
    const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResumeData(prev => ({ ...prev, summary: e.target.value }));
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResumeData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }));
    };
    
    const handleExperienceChange = (index: number, field: keyof Experience, value: string | string[]) => {
        const newExperience = [...resumeData.experience];
        (newExperience[index] as any)[field] = value;
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    };

    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: crypto.randomUUID(), jobTitle: '', company: '', location: '', dates: '', responsibilities: [''] }]
        }));
    };

    const removeExperience = (id: string) => {
        setResumeData(prev => ({...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
    };
    
    const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
        const newExperience = [...resumeData.experience];
        newExperience[expIndex].responsibilities[respIndex] = value;
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    };
    
    const addResponsibility = (expIndex: number) => {
        const newExperience = [...resumeData.experience];
        newExperience[expIndex].responsibilities.push('');
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    };
    
    const removeResponsibility = (expIndex: number, respIndex: number) => {
        const newExperience = [...resumeData.experience];
        newExperience[expIndex].responsibilities.splice(respIndex, 1);
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    };


    const handleEducationChange = (index: number, field: keyof Education, value: string) => {
        const newEducation = [...resumeData.education];
        (newEducation[index] as any)[field] = value;
        setResumeData(prev => ({...prev, education: newEducation }));
    };

    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, { id: crypto.randomUUID(), degree: '', institution: '', location: '', dates: '' }]
        }));
    };

    const removeEducation = (id: string) => {
        setResumeData(prev => ({...prev, education: prev.education.filter(edu => edu.id !== id) }));
    };

    // --- Project Handlers ---
    const handleProjectChange = (index: number, field: keyof Project, value: string | string[]) => {
        const newProjects = [...resumeData.projects];
        (newProjects[index] as any)[field] = value;
        setResumeData(prev => ({ ...prev, projects: newProjects }));
    };

    const addProject = () => {
        setResumeData(prev => ({
            ...prev,
            projects: [...prev.projects, { id: crypto.randomUUID(), name: '', link: '', technologies: [], description: '' }]
        }));
    };
    
    const removeProject = (id: string) => {
        setResumeData(prev => ({...prev, projects: prev.projects.filter(p => p.id !== id) }));
    };
    
    // --- Other Section Handlers ---
    const handleOtherSectionChange = (index: number, field: keyof OtherSection, value: string) => {
        const newSections = [...resumeData.otherSections];
        (newSections[index] as any)[field] = value;
        setResumeData(prev => ({...prev, otherSections: newSections }));
    }

    const addOtherSection = () => {
        setResumeData(prev => ({
            ...prev,
            otherSections: [...prev.otherSections, { id: crypto.randomUUID(), title: '', content: '' }]
        }));
    };

    const removeOtherSection = (id: string) => {
        setResumeData(prev => ({...prev, otherSections: prev.otherSections.filter(s => s.id !== id) }));
    };


    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index: number) => {
        if (draggedIndex !== null && index !== draggedIndex) {
            setDragOverIndex(index);
        }
    };
    
    const handleDragLeave = () => {
        // This is handled in handleDragEnd for robustness
    };

    const handleDrop = () => {
        if (draggedIndex === null || dragOverIndex === null) return;
        
        const newOrder = [...sectionOrder];
        const [movedSection] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(dragOverIndex, 0, movedSection);
        
        setSectionOrder(newOrder);
    };
    
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };
    
    // --- AI Generation Handler ---
    const handleGenerate = async (section: 'summary' | 'experience' | 'projects' | 'skills', index?: number) => {
        const sectionId = index !== undefined ? `${section}-${index}` : section;
        setGeneratingSection(sectionId);
        try {
            const result = await generateSectionContent(section, resumeData, jobDescription, index);
            
            switch(section) {
                case 'summary':
                    setResumeData(prev => ({ ...prev, summary: result }));
                    break;
                case 'experience':
                    if(index !== undefined) {
                        handleExperienceChange(index, 'responsibilities', result);
                    }
                    break;
                case 'projects':
                     if(index !== undefined) {
                        handleProjectChange(index, 'description', result);
                    }
                    break;
                case 'skills':
                    setResumeData(prev => ({ ...prev, skills: result }));
                    break;
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : "An unknown error occurred during generation.");
        } finally {
            setGeneratingSection(null);
        }
    }


    const sections: { [key in keyof ResumeData]?: React.ReactNode } = {
        personalDetails: (
            <Section title="Personal Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" name="fullName" value={resumeData.personalDetails.fullName} onChange={handlePersonalChange} />
                    <Input label="Email" name="email" value={resumeData.personalDetails.email} onChange={handlePersonalChange} type="email" />
                    <Input label="Phone" name="phone" value={resumeData.personalDetails.phone} onChange={handlePersonalChange} />
                    <Input label="Location" name="location" value={resumeData.personalDetails.location} onChange={handlePersonalChange} />
                    <Input label="LinkedIn URL" name="linkedin" value={resumeData.personalDetails.linkedin} onChange={handlePersonalChange} />
                    <Input label="Website/Portfolio" name="website" value={resumeData.personalDetails.website} onChange={handlePersonalChange} />
                </div>
            </Section>
        ),
        summary: (
            <Section title="Professional Summary" onGenerate={() => handleGenerate('summary')} generating={generatingSection === 'summary'}>
                <Textarea label="Summary" name="summary" value={resumeData.summary} onChange={handleSummaryChange} rows={4} />
            </Section>
        ),
        experience: (
            <Section title="Work Experience">
                {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 border border-accent/50 rounded-lg space-y-4 relative">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Job Title" name="jobTitle" value={exp.jobTitle} onChange={e => handleExperienceChange(index, 'jobTitle', e.target.value)} />
                            <Input label="Company" name="company" value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} />
                            <Input label="Location" name="location" value={exp.location} onChange={e => handleExperienceChange(index, 'location', e.target.value)} />
                            <Input label="Dates" name="dates" value={exp.dates} onChange={e => handleExperienceChange(index, 'dates', e.target.value)} placeholder="e.g., Jan 2020 - Present" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="block text-sm font-medium text-highlight">Responsibilities</label>
                                <GenerateButton 
                                    onClick={() => handleGenerate('experience', index)}
                                    loading={generatingSection === `experience-${index}`}
                                    disabled={!exp.jobTitle}
                                    tooltip="Generate bullet points with AI (requires Job Title)"
                                />
                            </div>
                            {exp.responsibilities.map((resp, respIndex) => (
                                <div key={respIndex} className="flex items-center space-x-2 mb-2">
                                    <input value={resp} onChange={e => handleResponsibilityChange(index, respIndex, e.target.value)} className="flex-grow bg-secondary border border-accent rounded-md p-2 focus:ring-teal focus:border-teal transition" />
                                    <button onClick={() => removeResponsibility(index, respIndex)} className="text-red-400 hover:text-red-300 p-1"><TrashIcon /></button>
                                </div>
                            ))}
                            <button onClick={() => addResponsibility(index)} className="text-teal hover:text-teal/80 text-sm flex items-center space-x-1 mt-2"><PlusIcon /> <span>Add Responsibility</span></button>
                        </div>
                        <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"><TrashIcon /></button>
                    </div>
                ))}
                 <button onClick={addExperience} className="w-full bg-accent hover:bg-highlight text-light font-bold py-2 px-4 rounded transition flex items-center justify-center space-x-2"><PlusIcon /> <span>Add Experience</span></button>
            </Section>
        ),
        projects: (
            <Section title="Projects">
                {resumeData.projects.map((proj, index) => (
                    <div key={proj.id} className="p-4 border border-accent/50 rounded-lg space-y-4 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input label="Project Name" name="name" value={proj.name} onChange={e => handleProjectChange(index, 'name', e.target.value)} />
                             <Input label="Project Link" name="link" value={proj.link} onChange={e => handleProjectChange(index, 'link', e.target.value)} />
                        </div>
                        <Input label="Technologies Used" name="technologies" value={proj.technologies.join(', ')} onChange={e => handleProjectChange(index, 'technologies', e.target.value.split(',').map(s => s.trim()))} placeholder="e.g., React, TypeScript, Node.js" />
                        <div>
                             <div className="flex items-center gap-2 mb-1">
                                <label htmlFor={`project-description-${index}`} className="block text-sm font-medium text-highlight">Description</label>
                                <GenerateButton
                                    onClick={() => handleGenerate('projects', index)}
                                    loading={generatingSection === `project-${index}`}
                                    disabled={!proj.name || proj.technologies.length === 0}
                                    tooltip="Generate description with AI (requires Project Name and Technologies)"
                                />
                            </div>
                            <textarea id={`project-description-${index}`} name="description" value={proj.description} onChange={e => handleProjectChange(index, 'description', e.target.value)} className="w-full bg-secondary border border-accent rounded-md p-2 focus:ring-teal focus:border-teal transition"></textarea>
                        </div>
                        <button onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"><TrashIcon /></button>
                    </div>
                ))}
                 <button onClick={addProject} className="w-full bg-accent hover:bg-highlight text-light font-bold py-2 px-4 rounded transition flex items-center justify-center space-x-2"><PlusIcon /> <span>Add Project</span></button>
            </Section>
        ),
        education: (
             <Section title="Education">
                {resumeData.education.map((edu, index) => (
                    <div key={edu.id} className="p-4 border border-accent/50 rounded-lg space-y-4 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Degree / Certificate" name="degree" value={edu.degree} onChange={e => handleEducationChange(index, 'degree', e.target.value)} />
                            <Input label="Institution" name="institution" value={edu.institution} onChange={e => handleEducationChange(index, 'institution', e.target.value)} />
                            <Input label="Location" name="location" value={edu.location} onChange={e => handleEducationChange(index, 'location', e.target.value)} />
                            <Input label="Dates" name="dates" value={edu.dates} onChange={e => handleEducationChange(index, 'dates', e.target.value)} placeholder="e.g., Graduated May 2019" />
                        </div>
                        <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"><TrashIcon /></button>
                    </div>
                ))}
                <button onClick={addEducation} className="w-full bg-accent hover:bg-highlight text-light font-bold py-2 px-4 rounded transition flex items-center justify-center space-x-2"><PlusIcon /> <span>Add Education</span></button>
            </Section>
        ),
        skills: (
             <Section title="Skills" onGenerate={() => handleGenerate('skills')} generating={generatingSection === 'skills'}>
                <Input label="Skills" name="skills" value={resumeData.skills.join(', ')} onChange={handleSkillsChange} placeholder="Enter skills separated by commas" />
            </Section>
        ),
        otherSections: (
            <Section title="Other Sections">
                {resumeData.otherSections.map((section, index) => (
                    <div key={section.id} className="p-4 border border-accent/50 rounded-lg space-y-4 relative">
                        <Input 
                            label="Section Title" 
                            name="title" 
                            value={section.title} 
                            onChange={e => handleOtherSectionChange(index, 'title', e.target.value)}
                            placeholder="e.g., Awards, Certifications, Leadership"
                        />
                        <Textarea 
                            label="Content"
                            name="content"
                            value={section.content}
                            onChange={e => handleOtherSectionChange(index, 'content', e.target.value)}
                            rows={5}
                            placeholder="Enter content here. You can use bullet points by starting lines with a dash (-) or asterisk (*)."
                        />
                        <button onClick={() => removeOtherSection(section.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"><TrashIcon /></button>
                    </div>
                ))}
                <button onClick={addOtherSection} className="w-full bg-accent hover:bg-highlight text-light font-bold py-2 px-4 rounded transition flex items-center justify-center space-x-2">
                    <PlusIcon /> <span>Add Custom Section</span>
                </button>
            </Section>
        )
    };


    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Resume Editor</h1>

            {sectionOrder.map((sectionKey, index) => (
                <div
                    key={sectionKey}
                    draggable
                    onDragStart={e => handleDragStart(e, index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragLeave={handleDragLeave}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className={`
                        group cursor-grab active:cursor-grabbing
                        transition-all duration-300 rounded-lg
                        ${draggedIndex === index ? 'opacity-30' : 'opacity-100'}
                        ${dragOverIndex === index ? 'scale-[1.02] bg-accent/20 ring-2 ring-teal' : ''}
                    `}
                >
                    {sections[sectionKey]}
                </div>
            ))}
        </div>
    );
};
