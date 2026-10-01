import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ArrowUp, Github, Linkedin, Instagram, Mail, Bot } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';
import { scrollToSection } from '../utils/smoothScroll';

interface FooterSectionProps {
  onTriggerWave: () => void;
  onOpenModelModal?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onTriggerWave, onOpenModelModal }) => {
  const fullText = "Thank you for visiting my portfolio. I hope we create something amazing together. Have a wonderful day.";
  const [typedText, setTypedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  // Typewriter effect for robot's closing speech
  useEffect(() => {
    if (typingIndex < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText((prev) => prev + fullText.charAt(typingIndex));
        setTypingIndex((prev) => prev + 1);
        if (typingIndex % 3 === 0) {
          soundEngine.playTypeSound();
        }
      }, 35);
      return () => clearTimeout(timer);
    }
  }, [typingIndex, fullText]);

  const socialLinks = [
    { icon: Github, href: PERSONAL_INFO.github, label: 'GitHub' },
    { icon: Linkedin, href: PERSONAL_INFO.linkedin, label: 'LinkedIn' },
    { icon: Instagram, href: PERSONAL_INFO.instagram, label: 'Instagram' },
    { icon: Mail, href: `mailto:${PERSONAL_INFO.email}`, label: 'Email' },
  ];

  return (
    <footer
      id="footer"
      className="relative min-h-screen w-full flex flex-col items-center justify-between pt-24 pb-12 px-4 sm:px-8 overflow-hidden"
    >
      {/* 
        Footer Main Stage:
        Left Column: Clear, unobstructed Speech Bubble Card (thanks message)
        Right Column: Open staging space for 3D LAP1 Mascot (stands on the right, waving!)
        This guarantees the visitor can read 100% of the thank you message without the robot blocking it.
      */}
      <div className="w-full max-w-6xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto min-h-[460px] z-10">
        {/* Left Column: Thank You Speech Card */}
        <div className="lg:col-span-7 flex flex-col justify-center order-1 lg:order-1 pt-0">
          <div className="p-5 sm:p-8 rounded-2xl bg-[#1A103D]/75 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/40 flex flex-col text-left gap-4 transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8]">
                <Bot className="w-4 h-4" />
                <span>LAP1_ASSISTANT // FAREWELL_MESSAGE</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8B5CF6]">
                <Heart className="w-3.5 h-3.5 fill-[#8B5CF6]" />
                <span className="font-mono text-[11px]">TRANSMITTING</span>
              </div>
            </div>

            {/* Typewriter message - fully readable */}
            <p className="text-base sm:text-lg text-white font-mono leading-relaxed min-h-[64px]">
              "{typedText}"
              {typingIndex < fullText.length && (
                <span className="inline-block w-2 h-4 ml-1 bg-[#38BDF8] animate-pulse" />
              )}
            </p>

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onTriggerWave();
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-xs font-mono text-white flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                
                <span>Wave Farewell to Bunny</span>
              </button>

              {/* {onOpenModelModal && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenModelModal();
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#B8B8D4] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Replace with Downloaded .GLB</span>
                </button>
              )} */}
            </div>
          </div>
        </div>

        {/* Right Column: Clear Space reserved for 3D LAP1 Mascot on desktop */}
        <div className="lg:col-span-5 h-48 sm:h-64 lg:h-full flex items-center justify-center order-2 lg:order-2 pointer-events-none">
          {/* Subtle staging circle on floor */}
          <div className="w-48 h-48 rounded-full border border-white/5 bg-white/[0.01] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#B8B8D4]/30 uppercase tracking-widest">
              LAP1 Stage
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Brand, Back to Top, Links, Copyright */}
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 pt-8 border-t border-white/10 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-lg font-bold font-['Syne',sans-serif] text-white">
              {PERSONAL_INFO.name}
            </span>
            <span className="text-xs font-mono text-[#B8B8D4]">
              {PERSONAL_INFO.tagline}
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-[#8B5CF6]/20 border border-white/10 hover:border-[#8B5CF6]/50 text-[#B8B8D4] hover:text-white transition-all hover:scale-110"
                  aria-label={s.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

          {/* Back to Top Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              soundEngine.playWhoosh();
              scrollToSection('#hero');
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all hover:scale-105 cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#38BDF8]" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#B8B8D4]/60 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Suyash Bhovad. All rights reserved. 3D model: Bunny <a href="https://sketchfab.com/3d-models/futuristic-flying-animated-robot-low-poly-c5b92c281dc444448e64c0607719c7a2" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#8B5CF6]">Futuristic flying animated Robot - Low Poly</a></p>
          <p className="flex items-center gap-1 justify-center">
            <span>Powered by TypeScript, Three.js & Imagination</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
