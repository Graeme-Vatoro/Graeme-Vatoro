
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { extractTextFromImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

export type ExtractionType = 'handwritten' | 'printed';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionType, setExtractionType] = useState<ExtractionType>('handwritten');

  // Handle global unhandled errors to provide feedback if the SDK fails
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('constructor')) {
        setError('System Error: A library initialization failed. Please refresh the page.');
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setExtractedText('');
    setError(null);
  };

  const handleClear = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
    setExtractedText('');
    setError(null);
    setExtractionType('handwritten');
  };

  const handleExtractText = useCallback(async () => {
    if (!imageFile) {
      setError('Please select or capture an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedText('');

    try {
      const { mimeType, base64Data } = await fileToBase64(imageFile);
      const text = await extractTextFromImage(mimeType, base64Data, extractionType);
      setExtractedText(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, extractionType]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans pb-20 selection:bg-cyan-500/30">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-cyan-400 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-cyan-900/50 text-cyan-400 rounded-full text-xs font-mono">01</span>
                  Extraction Mode
                </h2>
                <div className="grid grid-cols-2 gap-2 bg-gray-900/50 p-1.5 rounded-xl border border-gray-700">
                  <button
                    onClick={() => setExtractionType('handwritten')}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      extractionType === 'handwritten' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Handwritten
                  </button>
                  <button
                    onClick={() => setExtractionType('printed')}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      extractionType === 'printed' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M3 15h6"/><path d="M3 11h3"/><path d="M3 19h10"/></svg>
                    Printed Text
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-cyan-400 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-cyan-900/50 text-cyan-400 rounded-full text-xs font-mono">02</span>
                  Capture or Upload
                </h2>
                <ImageUploader onImageSelect={handleImageSelect} imageUrl={imageUrl} />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleExtractText}
                  disabled={!imageFile || isLoading}
                  className="flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-cyan-600 hover:bg-cyan-500 active:transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/><path d="m11 8 3 3-3 3"/><path d="m8 11h6"/></svg>
                      Convert to Digital
                    </>
                  ) }
                </button>
                {imageFile && !isLoading && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-4 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold rounded-xl transition-colors border border-gray-600 group"
                    title="Clear everything"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-red-400 transition-colors"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Output Section */}
          <div className="lg:col-span-7">
            <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700 h-full flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-cyan-900/50 text-cyan-400 rounded-full text-xs font-mono">03</span>
                  Digital Output
                </h2>
                {isLoading && (
                    <div className="flex items-center gap-2 text-cyan-400 text-sm animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        AI Processing...
                    </div>
                )}
              </div>
              
              <div className="flex-grow flex flex-col">
                <ResultDisplay
                  text={extractedText}
                  isLoading={isLoading}
                  error={error}
                  extractionType={extractionType}
                />
              </div>

              {extractedText && (
                  <div className="mt-8 pt-6 border-t border-gray-700/50 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Ready for editing
                      </div>
                      <span>Gemini 3 Flash</span>
                  </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
