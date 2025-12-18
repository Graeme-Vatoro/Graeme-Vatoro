
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-md border-b border-gray-700">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <div>
            <h1 className="text-2xl font-bold text-white">Handwriting to Text Extractor</h1>
            <p className="text-sm text-gray-400">Powered by Gemini AI</p>
          </div>
        </div>
      </div>
    </header>
  );
};
