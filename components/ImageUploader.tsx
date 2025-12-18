
import React, { useCallback } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imageUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imageUrl }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  }, [onImageSelect]);
  
  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div>
      <label 
        htmlFor="file-upload" 
        className="relative block w-full aspect-video rounded-lg border-2 border-dashed border-gray-600 p-6 text-center hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 cursor-pointer transition-colors"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mb-3">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="block text-sm font-medium text-gray-400">
              Drag & drop, <span className="text-cyan-400">browse</span>, or take a picture
            </span>
            <span className="mt-1 block text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</span>
          </div>
        )}
      </label>
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/webp"
        capture="environment"
        onChange={handleFileChange}
      />
    </div>
  );
};
