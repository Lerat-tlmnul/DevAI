import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  selectedImage: string | null;
  onImageSelected: (base64: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  onImageSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onImageSelected(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Erreur accès caméra:', err);
      alert('Impossible d’accéder à la caméra. Tu peux choisir une photo depuis tes fichiers.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onImageSelected(dataUrl);
      }
      stopCamera();
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Selected Image Thumbnail Badge */}
      {selectedImage && !isCameraActive && (
        <div className="relative inline-flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-xl bg-zinc-100 border border-zinc-200 mb-2">
          <img
            src={selectedImage}
            alt="Devoir joint"
            className="w-8 h-8 object-cover rounded-lg border border-zinc-200"
          />
          <span className="text-[11px] font-medium text-zinc-800">
            Photo prête
          </span>
          <button
            type="button"
            onClick={() => onImageSelected(null)}
            className="p-1 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-black cursor-pointer transition-colors"
            title="Supprimer la photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action buttons (only show if no image selected) */}
      {!selectedImage && !isCameraActive && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Importer une photo"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={startCamera}
            className="h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Prendre une photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full-Screen Camera Viewfinder on Mobile */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white p-4">
          {/* Top Camera Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-zinc-400">
              Scanner devoir
            </span>
            <button
              type="button"
              onClick={stopCamera}
              className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera Viewfinder */}
          <div className="relative my-auto rounded-3xl overflow-hidden aspect-[3/4] max-h-[70vh] w-full max-w-sm mx-auto bg-zinc-900 border border-zinc-700">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-xs text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                Cadrez votre exercice
              </span>
            </div>
          </div>

          {/* Shutter Button */}
          <div className="flex items-center justify-center pb-6">
            <button
              type="button"
              onClick={capturePhoto}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
              title="Prendre la photo"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
