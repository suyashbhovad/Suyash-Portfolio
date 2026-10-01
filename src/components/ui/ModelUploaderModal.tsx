import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Bot, AlertCircle } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface ModelUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelLoaded: (url: string) => void;
}

export const ModelUploaderModal: React.FC<ModelUploaderModalProps> = ({
  isOpen,
  onClose,
  onModelLoaded,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      setError('Please provide a valid .glb or .gltf 3D model file.');
      return;
    }

    setError(null);
    setFileName(file.name);
    soundEngine.playRoboBeep();

    const objectUrl = URL.createObjectURL(file);
    onModelLoaded(objectUrl);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        soundEngine.playClick();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#0F0C29] border border-white/15 p-6 sm:p-8 shadow-2xl shadow-black/80 text-white animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:text-[#8B5CF6] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#1A103D] border border-[#8B5CF6]/40 text-[#38BDF8]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-['Syne',sans-serif]">
              Load Custom 3D Mascot
            </h3>
            <p className="text-xs font-mono text-[#8B5CF6]">
              Sketchfab GLTF / GLB Loader
            </p>
          </div>
        </div>

        <p className="text-xs text-[#B8B8D4] leading-relaxed mb-6">
          The procedural Cyberpunk Robot Rabbit is currently active. If you downloaded your Sketchfab robot rabbit model (.glb / .gltf), select it here to render it directly in the scene!
        </p>

        {fileName ? (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center gap-3 text-sm text-[#10B981]">
            <CheckCircle2 className="w-5 h-5" />
            <span>Loaded: {fileName}</span>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-[#8B5CF6]/40 hover:border-[#8B5CF6] bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group">
            <Upload className="w-8 h-8 text-[#38BDF8] group-hover:scale-110 transition-transform mb-2" />
            <span className="text-xs font-mono font-semibold text-white">
              Choose .glb or .gltf file
            </span>
            <span className="text-[11px] text-[#B8B8D4] mt-1">
              or drag & drop here
            </span>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
