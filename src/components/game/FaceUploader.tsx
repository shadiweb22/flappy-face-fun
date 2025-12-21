import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FaceUploaderProps {
  faceImage: string | null;
  onImageUpload: (image: string) => void;
  onImageClear: () => void;
}

export const FaceUploader: React.FC<FaceUploaderProps> = ({
  faceImage,
  onImageUpload,
  onImageClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-semibold text-foreground">Your Bird Face</h3>
      
      <div className="relative">
        {faceImage ? (
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-lg neon-box">
              <img
                src={faceImage}
                alt="Your face"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={onImageClear}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-muted border-4 border-dashed border-muted-foreground/50 flex items-center justify-center">
            <Camera className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="gameSecondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={16} />
        {faceImage ? 'Change Photo' : 'Upload Photo'}
      </Button>
    </div>
  );
};
