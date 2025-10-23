import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageUrl(URL.createObjectURL(file));
      onImageUpload(file);
    }
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       setImageUrl(URL.createObjectURL(file));
       onImageUpload(file);
    }
  }, [onImageUpload, disabled]);

  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  
  const onDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, #374151 1px, transparent 0)
            `,
            backgroundSize: '20px 20px',
        }}
        className={`relative flex justify-center w-full h-80 px-4 transition-all duration-300 bg-slate-800 border-2 border-slate-700 rounded-2xl appearance-none cursor-pointer focus:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900
        ${isDragging ? 'border-cyan-500 scale-105' : 'hover:border-slate-600'}
        ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Uploaded landmark" className="object-contain h-full w-full p-2 rounded-2xl" />
        ) : (
          <span className="flex flex-col items-center justify-center space-y-3 text-slate-400">
            <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
              <UploadIcon className={`w-12 h-12 transition-colors ${isDragging ? 'text-cyan-300' : 'text-slate-500'}`} />
            </div>
            <span className="font-medium text-lg">
              Drop a photo of a landmark or{' '}
              <span className="text-cyan-400 font-semibold">browse</span>
            </span>
            <span className="text-sm text-slate-500">Maximum file size: 10MB</span>
          </span>
        )}
        <input
          type="file"
          name="file_upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
