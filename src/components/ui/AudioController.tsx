import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

export const AudioController: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showSlider, setShowSlider] = useState(false);
  const [ambienceActive, setAmbienceActive] = useState(false);

  useEffect(() => {
    setIsMuted(soundEngine.getIsMuted());
    setVolume(soundEngine.getVolume());
  }, []);

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playClick();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
    if (isMuted && val > 0) {
      soundEngine.toggleMute();
      setIsMuted(false);
    }
  };

  const handleToggleAmbience = () => {
    if (ambienceActive) {
      soundEngine.stopAmbience();
      setAmbienceActive(false);
    } else {
      soundEngine.startAmbience();
      setAmbienceActive(true);
      soundEngine.playClick();
    }
  };

  return (
    <div
      id="audio-controller-wrapper"
      className="fixed top-5 right-5 z-50 flex items-center gap-2"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {/* Expandable Volume Slider */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A103D]/80 border border-[#8B5CF6]/30 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          showSlider ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 translate-x-4 pointer-events-none w-0 overflow-hidden px-0'
        }`}
      >
        <span className="text-[11px] font-mono text-[#B8B8D4] whitespace-nowrap">
          {Math.round(volume * 100)}%
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 h-1.5 bg-[#050816] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
          aria-label="Audio Volume Control"
        />

        {/* Ambient Drone Toggle */}
        <button
          onClick={handleToggleAmbience}
          title={ambienceActive ? "Turn off background synth drone" : "Turn on background synth drone"}
          className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono transition-colors ${
            ambienceActive
              ? 'bg-[#8B5CF6]/30 text-[#FFFFFF] border border-[#8B5CF6]/50'
              : 'text-[#B8B8D4] hover:text-white'
          }`}
        >
          <Radio className={`w-3 h-3 ${ambienceActive ? 'text-[#38BDF8] animate-pulse' : ''}`} />
          <span>Drone</span>
        </button>
      </div>

      {/* Main Sound Toggle Button */}
      <button
        id="audio-toggle-btn"
        onClick={handleToggleMute}
        onMouseEnter={() => soundEngine.playHover()}
        className={`group relative flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] ${
          isMuted
            ? 'bg-[#1A103D]/70 border-white/10 text-[#B8B8D4]'
            : 'bg-[#1A103D]/90 border-[#8B5CF6]/40 text-[#FFFFFF] shadow-[0_0_20px_rgba(139,92,246,0.3)]'
        }`}
        aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-[#B8B8D4] group-hover:text-white transition-colors" />
        ) : (
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
            {/* Animated Equalizer Bars */}
            <div className="flex items-end gap-0.5 h-3.5 w-3">
              <span className="w-0.5 bg-[#8B5CF6] rounded-full animate-[bounce_0.8s_infinite] h-2" />
              <span className="w-0.5 bg-[#38BDF8] rounded-full animate-[bounce_0.6s_infinite] h-3.5" />
              <span className="w-0.5 bg-[#8B5CF6] rounded-full animate-[bounce_0.9s_infinite] h-1.5" />
            </div>
          </div>
        )}

        <span className="text-xs font-mono tracking-wider hidden sm:inline">
          {isMuted ? 'MUTED' : 'SFX'}
        </span>
      </button>
    </div>
  );
};
