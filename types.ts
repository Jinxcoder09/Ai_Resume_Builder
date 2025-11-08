export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  location: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  dates: string;
  responsibilities: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  dates: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  technologies: string[];
  description: string;
}

export interface OtherSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  otherSections: OtherSection[];
}

export interface ImprovementSuggestion {
  point: string;
  example: string;
}

export interface AnalysisResult {
  score: number;
  strengths: string;
  improvementSuggestions: ImprovementSuggestion[];
  keywordSuggestions: string[];
}