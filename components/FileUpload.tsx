import React, { useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onParse: (file: File) => void;
  onStartFromScratch: () => void;
  isParsing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onParse, onStartFromScratch, isParsing }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.type === 'application/pdf') {
        onParse(file);
      } else {
        setError('Please upload a .txt or .pdf file.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="w-full max-w-lg p-8 space-y-8 bg-secondary rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-light">AI Resume Builder</h1>
        <p className="text-highlight">
          Get started by uploading your existing resume, or start fresh.
        </p>
        
        <div className="space-y-4">
          <label
            htmlFor="resume-upload"
            className="cursor-pointer group block w-full px-6 py-4 border-2 border-dashed border-accent rounded-lg text-center hover:border-teal transition-colors"
          >
            <div className="flex flex-col items-center justify-center">
              <UploadIcon />
              <p className="mt-2 text-sm text-highlight">
                <span className="font-semibold text-teal">Upload a .txt or .pdf file</span> or drag and drop
              </p>
              <p className="text-xs text-accent">For best results, use a standard resume format.</p>
            </div>
            <input id="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.pdf" disabled={isParsing} />
          </label>
           {isParsing && <p className="text-teal animate-pulse">Parsing your resume with AI...</p>}
           {error && <p className="text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-center">
          <span className="h-px w-16 bg-accent"></span>
          <span className="px-3 text-sm text-accent">OR</span>
          <span className="h-px w-16 bg-accent"></span>
        </div>

        <button
          onClick={onStartFromScratch}
          disabled={isParsing}
          className="w-full py-3 px-4 text-white bg-teal/80 rounded-lg font-semibold hover:bg-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal focus:ring-offset-primary transition-transform transform hover:scale-105 disabled:opacity-50"
        >
          Start From Scratch
        </button>
      </div>
    </div>
  );
};