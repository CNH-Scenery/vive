import React, { ChangeEvent, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  description: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, description, image, onImageChange }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{label}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      
      {image ? (
        <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
          <img src={image} alt="Preview" className="w-full h-full object-cover" />
          <button 
            onClick={() => onImageChange(null)}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div 
          className={`relative w-full aspect-[4/5] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 text-center
            ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="font-medium text-gray-700">이미지 선택 또는 드래그</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG 지원</p>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;