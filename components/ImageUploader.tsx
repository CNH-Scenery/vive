import React, { ChangeEvent, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  description: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  description,
  image,
  onImageChange,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Unable to read image"));
      reader.onload = () => {
        const previewImage = new Image();
        previewImage.onerror = () => reject(new Error("Unable to load image"));
        previewImage.onload = () => {
          const maxSide = 2400;
          const minArea = 3_800_000;
          const sourceArea = previewImage.width * previewImage.height;
          const minAreaScale = Math.sqrt(minArea / sourceArea);
          const maxSideScale = maxSide / Math.max(previewImage.width, previewImage.height);
          const scale = Math.min(maxSideScale, Math.max(1, minAreaScale));
          const width = Math.round(previewImage.width * scale);
          const height = Math.round(previewImage.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Unable to resize image"));
            return;
          }

          context.drawImage(previewImage, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        previewImage.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      resizeImage(file)
        .then(onImageChange)
        .catch((error) => {
          console.error(error);
          onImageChange(null);
        });
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      handleFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files?.[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="w-full">
      <h3 className="mb-1 text-lg font-semibold text-gray-800">{label}</h3>
      <p className="mb-4 text-sm text-gray-500">{description}</p>

      {image ? (
        <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
          <img src={image} alt="업로드한 사진 미리보기" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-gray-600 shadow-lg transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="이미지 삭제"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          className={`relative flex aspect-[4/5] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <ImageIcon className="h-6 w-6" />
          </div>
          <p className="font-medium text-gray-700">이미지 선택 또는 드래그</p>
          <p className="mt-1 text-xs text-gray-400">JPG, PNG 지원</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
