import React from 'react';

interface HomePageProps {
  onGetStarted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-primary text-light flex flex-col">
      <header className="container mx-auto px-6 py-4">
        <h1 className="text-2xl font-bold">AI Resume Builder</h1>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-3xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Craft Your Future with a <span className="text-teal">Resume That Stands Out</span>
          </h2>
          <p className="mt-6 text-lg text-highlight max-w-xl mx-auto">
            Leverage the power of AI to build a professional resume, get an instant ATS score, and receive expert suggestions to land your dream job.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-10 px-8 py-4 bg-teal text-primary font-bold rounded-lg text-lg hover:bg-teal/90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal focus:ring-offset-primary"
          >
            Build My Resume Now
          </button>
        </div>
      </main>
      <footer className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-teal mb-2">Check ATS Score</h3>
            <p className="text-highlight">See how your resume scores against job descriptions and get actionable feedback to improve it.</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-teal mb-2">AI-Powered Descriptions</h3>
            <p className="text-highlight">Generate compelling summary and experience descriptions tailored to your career goals.</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-teal mb-2">Import with Ease</h3>
            <p className="text-highlight">Start quickly by uploading your existing resume in PDF or TXT format. Our AI will do the rest.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};