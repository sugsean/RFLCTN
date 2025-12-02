
import React, { useRef } from 'react';
import { Icons } from '../constants';

interface UploadButtonProps {
  onUpload: (files: File[]) => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: keyof typeof Icons;
  multiple?: boolean;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ onUpload, label, variant = 'primary', icon, multiple = false }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
    // Resetting the input value is handled by the fact that we don't bind value, 
    // but if we want to re-upload same file we should manually clear.
    e.target.value = ''; 
  };

  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer shadow-sm active:scale-95";
  const variants = {
    primary: "bg-stone-900 text-white hover:bg-stone-800",
    secondary: "bg-stone-200 text-stone-900 hover:bg-stone-300",
    outline: "border border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50"
  };

  const IconComponent = icon ? Icons[icon] : Icons.Upload;

  return (
    <label className={`${baseClasses} ${variants[variant]}`}>
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple={multiple}
      />
      <IconComponent />
      <span>{label}</span>
    </label>
  );
};
