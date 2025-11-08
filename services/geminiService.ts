import { GoogleGenAI, Type } from "@google/genai";
import type { ResumeData, AnalysisResult, Experience, Project } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    personalDetails: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        website: { type: Type.STRING },
        location: { type: Type.STRING },
      },
      required: ['fullName', 'email', 'phone']
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          dates: { type: Type.STRING },
          responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['jobTitle', 'company', 'dates', 'responsibilities']
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          institution: { type: Type.STRING },
          location: { type: Type.STRING },
          dates: { type: Type.STRING },
        },
        required: ['degree', 'institution', 'dates']
      }
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    projects: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                link: { type: Type.STRING },
                technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING },
            },
            required: ['name', 'technologies', 'description']
        }
    },
    otherSections: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
            },
            required: ['title', 'content']
        }
    }
  },
  required: ['personalDetails', 'summary', 'experience', 'education', 'skills', 'projects']
};


const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER, description: "A score from 0 to 100." },
        strengths: { type: Type.STRING, description: "A brief summary of strengths." },
        improvementSuggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING, description: "A specific area of improvement, e.g., 'Quantify achievements'." },
                    example: { type: Type.STRING, description: "A concrete example of how to apply the improvement, e.g., 'Instead of `Managed a team`, write `Managed a team of 5 engineers...`'" }
                },
                required: ['point', 'example']
            },
            description: "An array of actionable suggestions for improvement."
        },
        keywordSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of suggested keywords.",
        },
    },
    required: ['score', 'strengths', 'improvementSuggestions', 'keywordSuggestions'],
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // The result is in format "data:application/pdf;base64,JVBERi0xLjQKJ..."
            // We only need the base64 part
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export const parseResume = async (file: File): Promise<ResumeData> => {
    const prompt = `
        Parse the following resume document and extract the information into a structured JSON format. 
        Fill in all fields as best as you can. For fields that are not present, use empty strings or empty arrays.
        Recognize custom sections like 'Awards', 'Certifications', or 'Leadership' and place them in the 'otherSections' array, with 'title' being the section header and 'content' being the body.
        Ensure responsibilities are concise bullet points. The document is provided as a file.
    `;
    
    const fileContent = await fileToBase64(file);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { data: fileContent, mimeType: file.type } },
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: resumeSchema
        }
    });

    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        // Add unique IDs to experience and education for React keys
        if (parsed.experience) {
            parsed.experience = parsed.experience.map((exp: any) => ({ ...exp, id: crypto.randomUUID() }));
        }
        if (parsed.education) {
            parsed.education = parsed.education.map((edu: any) => ({ ...edu, id: crypto.randomUUID() }));
        }
        if (parsed.projects) {
            parsed.projects = parsed.projects.map((proj: any) => ({ ...proj, id: crypto.randomUUID() }));
        }
        if (parsed.otherSections) {
            parsed.otherSections = parsed.otherSections.map((sec: any) => ({ ...sec, id: crypto.randomUUID() }));
        }
        return parsed as ResumeData;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Could not parse the resume. The format might be unconventional or the file corrupted.");
    }
};


export const analyzeResume = async (resumeData: ResumeData, jobDescription: string): Promise<AnalysisResult> => {
    const prompt = `
        You are an expert ATS (Applicant Tracking System) and professional resume reviewer. Analyze the following resume, provided as a JSON object, in the context of the target job description.

        **Resume Data:**
        \`\`\`json
        ${JSON.stringify(resumeData, null, 2)}
        \`\`\`

        **Job Description:**
        ---
        ${jobDescription}
        ---

        Based on your analysis, provide a detailed evaluation in a JSON format. The evaluation should include:
        1.  'score': A numerical score from 0 to 100, where 100 is a perfect match.
        2.  'strengths': A concise summary (2-3 sentences) of the resume's strongest points.
        3.  'improvementSuggestions': An array of 2-3 actionable improvement suggestions. Each object in the array should contain a 'point' (the area to improve, e.g., "Quantify Achievements") and an 'example' (a concrete example of how to apply it).
        4.  'keywordSuggestions': An array of 5-10 specific, high-impact keywords or short phrases from the job description that are missing or underrepresented in the resume.

        Ensure your entire output is a single, valid JSON object conforming to the specified schema. Do not use a 'weaknesses' field.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        }
    });

    try {
        return JSON.parse(response.text.trim()) as AnalysisResult;
    } catch (e) {
        console.error("Failed to parse Gemini analysis response:", response.text);
        throw new Error("Could not analyze the resume.");
    }
};

type SectionKey = 'summary' | 'experience' | 'projects' | 'skills';

export const generateSectionContent = async (
    section: SectionKey, 
    resumeData: ResumeData, 
    jobDescription: string, 
    index?: number
): Promise<any> => {
    let prompt = '';
    let responseSchema: any = null;
    const contextResume = JSON.stringify({ ...resumeData, summary: '', experience: resumeData.experience.map(e => ({...e, responsibilities: []})) });

    switch (section) {
        case 'summary':
            prompt = `Based on the experience and skills in this resume JSON, write a compelling 2-3 sentence professional summary for a job described as: "${jobDescription}". The resume is: ${contextResume}. Return only the summary text as a single string.`;
            break;
        case 'experience':
            if (index === undefined || !resumeData.experience[index]) throw new Error("Invalid experience index");
            const exp = resumeData.experience[index];
            prompt = `For a person with the job title "${exp.jobTitle}" at "${exp.company}", write 4 professional, action-oriented resume bullet points describing their responsibilities. Base the suggestions on the overall resume context (${contextResume}) and this target job description: "${jobDescription}". Return a JSON array of strings. Example: ["Developed feature A using React", "Managed project B"]`;
            responseSchema = { type: Type.ARRAY, items: { type: Type.STRING } };
            break;
        case 'projects':
            if (index === undefined || !resumeData.projects[index]) throw new Error("Invalid project index");
            const proj = resumeData.projects[index];
            prompt = `For a project named "${proj.name}" that used these technologies: "${proj.technologies.join(', ')}", write a 2-sentence description for a resume. The target job is: "${jobDescription}". Return only the description text as a single string.`;
            break;
        case 'skills':
            prompt = `Based on the following resume and target job description, suggest a list of 10-15 relevant skills. Resume: ${contextResume}. Job Description: "${jobDescription}". Return a JSON array of strings.`;
            responseSchema = { type: Type.ARRAY, items: { type: Type.STRING } };
            break;
        default:
            throw new Error("Invalid section for content generation.");
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            ...(responseSchema && { 
                responseMimeType: 'application/json',
                responseSchema 
            })
        }
    });

    try {
        if (responseSchema) {
            return JSON.parse(response.text.trim());
        }
        return response.text.trim();
    } catch (e) {
        console.error(`Failed to parse Gemini generation response for section ${section}:`, response.text);
        throw new Error(`Could not generate content for ${section}.`);
    }
};

export const rewriteSection = async (
    section: 'summary', // Starting with just summary
    currentText: string,
    resumeData: ResumeData,
    jobDescription: string
): Promise<string> => {
    const prompt = `You are a professional resume writer. Rewrite the following professional summary to be more impactful and better aligned with the target job description. Incorporate relevant keywords and quantify achievements where possible.

    **Current Summary:**
    "${currentText}"

    **Full Resume Context (for reference):**
    \`\`\`json
    ${JSON.stringify({ ...resumeData, summary: '' }, null, 2)}
    \`\`\`

    **Target Job Description:**
    ---
    ${jobDescription}
    ---

    Return ONLY the rewritten summary text as a single string.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};