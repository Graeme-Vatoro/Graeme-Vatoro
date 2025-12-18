
import React, { useState, useEffect, useRef } from 'react';
import { downloadDocx } from '../utils/docxUtils';
import type { ExtractionType } from '../App';

interface ResultDisplayProps {
  text: string;
  isLoading: boolean;
  error: string | null;
  extractionType: ExtractionType;
}

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse p-4">
    <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
      <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
      <div className="h-4 bg-gray-700/50 rounded w-4/5"></div>
    </div>
    <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
  </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ text, isLoading, error, extractionType }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    let textToCopy = text;
    if (extractionType === 'printed' && contentRef.current) {
        textToCopy = contentRef.current.innerText;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopyStatus('copied');
  };
  
  const handleDownload = () => {
    if (!text) return;
    
    if (extractionType === 'printed') {
      downloadDocx(text, 'extracted-document.docx');
    } else {
      // For handwriting, download as a simple text file
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-handwriting.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    if (copyStatus === 'copied') {
      const timer = setTimeout(() => setCopyStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);
  
  useEffect(() => {
    setCopyStatus('idle');
  }, [text]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }
    if (error) {
      return (
        <div className="text-red-400 bg-red-900/30 p-6 rounded-lg border border-red-800/50">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="font-bold">Extraction Failed</p>
          </div>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      );
    }
    if (text) {
      if (extractionType === 'printed') {
        return (
            <div 
                ref={contentRef}
                className="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 w-full h-full p-6 bg-gray-900 text-gray-300 rounded-md border border-gray-700 overflow-auto resize-y"
                dangerouslySetInnerHTML={{ __html: text }}
                style={{minHeight: '300px', maxHeight: '600px'}}
            />
        );
      }
      return (
        <div className="relative group">
            <textarea
              readOnly
              value={text}
              className="w-full p-6 bg-[#fdfcf0] text-[#2c3e50] font-serif rounded-md border border-[#e0dec5] shadow-inner focus:ring-0 focus:outline-none resize-y leading-relaxed"
              rows={12}
              style={{
                backgroundImage: 'linear-gradient(#e1e1e1 1px, transparent 1px)',
                backgroundSize: '100% 2rem',
                lineHeight: '2rem',
                paddingTop: '2.4rem'
              }}
            />
            <div className="absolute top-2 left-6 text-[10px] uppercase tracking-widest text-[#9a9881] font-sans font-bold">
                Handwritten Transcription
            </div>
        </div>
      );
    }
    return (
      <div className="text-center py-20 bg-gray-800/20 rounded-xl border border-dashed border-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-600 mb-4 opacity-50">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
        <p className="text-gray-500 font-medium">Extracted text will appear here</p>
        <p className="text-gray-600 text-sm mt-1">Upload an image to start the process</p>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {text && !isLoading && !error && (
        <div className="absolute -top-12 right-0 flex items-center gap-2 z-10">
          <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-all text-xs font-medium"
              title={extractionType === 'printed' ? "Download Word (.docx)" : "Download Text (.txt)"}
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {extractionType === 'printed' ? 'Word' : 'Text'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-all text-xs font-medium"
            title="Copy to clipboard"
          >
            {copyStatus === 'idle' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied
              </>
            )}
          </button>
        </div>
      )}
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
};
