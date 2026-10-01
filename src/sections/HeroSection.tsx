import React, { useState, useEffect } from 'react';
import { Download, ArrowUpRight, Send, Github, Linkedin, Instagram, Mail, Sparkles, Terminal } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';
import { scrollToSection } from '../utils/smoothScroll';

interface HeroSectionProps {
  onTriggerWave: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onTriggerWave }) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedRole, setDisplayedRole] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(120);

  // Rotating roles with typewriter effect
  useEffect(() => {
    const currentFullRole = PERSONAL_INFO.roles[roleIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing characters
        const nextText = currentFullRole.slice(0, displayedRole.length + 1);
        setDisplayedRole(nextText);
        soundEngine.playTypeSound();

        if (nextText === currentFullRole) {
          // Pause at completed word
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        // Deleting characters
        const nextText = currentFullRole.slice(0, displayedRole.length - 1);
        setDisplayedRole(nextText);

        if (nextText === '') {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % PERSONAL_INFO.roles.length);
          setTypingSpeed(100);
        } else {
          setTypingSpeed(50);
        }
      }
    }, isDeleting ? 45 : typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedRole, isDeleting, roleIndex, typingSpeed]);

  const socialLinks = [
    { icon: Github, href: PERSONAL_INFO.github, label: 'GitHub' },
    { icon: Linkedin, href: PERSONAL_INFO.linkedin, label: 'LinkedIn' },
    { icon: Instagram, href: PERSONAL_INFO.instagram, label: 'Instagram' },
    { icon: Mail, href: `mailto:${PERSONAL_INFO.email}`, label: 'Email' },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center pt-24 pb-16 px-4 sm:px-8 lg:px-16 overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Text & Call to Actions */}
        <div className="lg:col-span-7 flex flex-col items-start z-10">
          {/* Cyber Terminal Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A103D]/70 border border-white/10 backdrop-blur-xl mb-6 shadow-lg shadow-black/20">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <Terminal className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              PORTFOLIO
            </span>
          </div>

          {/* Large Heading */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-['Syne',sans-serif] tracking-tight text-white leading-[1.1]">
        Hi, I'm <br />
        <span className="inline-block whitespace-nowrap text-3xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-[#FFFFFF] via-[#E2E8F0] to-[#8B5CF6] bg-clip-text text-transparent">
          {PERSONAL_INFO.name}
        </span>
      </h1>

          {/* Rotating Role Subtitle with Glowing Cursor */}
          <div className="h-12 sm:h-14 mt-3 flex items-center">
            <h2 className="text-xl sm:text-3xl font-semibold font-mono text-[#38BDF8] flex items-center">
              <span>{displayedRole}</span>
              <span className="inline-block w-2.5 h-7 ml-1 bg-[#8B5CF6] animate-pulse shadow-[0_0_8px_#8B5CF6]" />
            </h2>
          </div>

          {/* Short Introduction */}
          <p className="mt-4 text-[#B8B8D4] text-base sm:text-lg max-w-xl leading-relaxed">
            {PERSONAL_INFO.bio}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            {/* View Projects Button */}
            <button
              id="hero-view-projects-btn"
              onClick={() => {
                soundEngine.playClick();
                soundEngine.playWhoosh();
                scrollToSection('#projects');
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] hover:from-[#1E40AF] hover:via-[#1D4ED8] hover:to-[#2563EB] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <span>View Projects</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {/* Download Resume Button */}
            <button
              id="hero-download-resume-btn"
              onClick={() => {
                soundEngine.playClick();
                scrollToSection('#resume');
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-[#0B0F19]/80 hover:bg-[#2563EB]/20 border border-white/10 hover:border-[#38BDF8]/50 text-white text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#38BDF8]" />
              <span>Download Resume</span>
            </button>

            {/* Hire Me CTA Button */}
            <button
              id="hero-hire-me-btn"
              onClick={() => {
                soundEngine.playClick();
                scrollToSection('#contact');
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#38BDF8]" />
              <span>Hire Me</span>
            </button>
          </div>

          {/* Social Icons & Wave Badge */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10 w-full">
            <div className="flex items-center gap-2.5">
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
                    className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-[#1A103D]/50 border border-white/10 hover:border-[#8B5CF6]/60 text-[#B8B8D4] hover:text-white hover:bg-[#8B5CF6]/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)] flex items-center justify-center"
                    aria-label={`Visit ${s.label}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Interactive mascot nudge */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onTriggerWave();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="min-h-[44px] flex items-center gap-2 text-xs font-mono text-[#8B5CF6] hover:text-white transition-colors group cursor-pointer"
            >
              {/* <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] group-hover:rotate-12 transition-transform" /> */}
              <span>Click the Cyber Rabbit to wave!</span>
            </button>
          </div>
        </div>

        {/* Right Column: Spacing allocated for 3D Mascot Canvas (Right side in Hero) */}
        <div className="lg:col-span-5 h-72 sm:h-96 lg:h-[550px] relative pointer-events-none flex items-center justify-center">
          {/* Subtle glowing ring behind mascot */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-[#8B5CF6]/20 bg-radial from-[#7C3AED]/10 to-transparent blur-xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
