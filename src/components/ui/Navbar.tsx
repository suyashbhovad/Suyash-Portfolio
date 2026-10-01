import React, { useState, useEffect } from 'react';
import { Menu, X, Bot, Sparkles, Send, Upload } from 'lucide-react';
import { SectionId } from '../../types';
import { soundEngine } from '../../utils/audio';
import { scrollToSection } from '../../utils/smoothScroll';

interface NavbarProps {
  currentSection: SectionId;
  onTriggerWave: () => void;
  onOpenModelModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentSection, onTriggerWave, onOpenModelModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: SectionId; label: string; href: string }[] = [
    { id: 'hero', label: 'Home', href: '#hero' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'skills', label: 'Skills', href: '#skills' },
    { id: 'experience', label: 'Timeline', href: '#experience' },
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'services', label: 'Services', href: '#services' },
    { id: 'reviews', label: 'Reviews', href: '#reviews' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    soundEngine.playClick();
    soundEngine.playWhoosh();
    scrollToSection(href);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-4 sm:px-8 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Mascot Indicator */}
        <button
          id="brand-logo-btn"
          onClick={() => handleNavClick('#hero')}
          onMouseEnter={() => soundEngine.playHover()}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/80 border border-white/10 hover:border-[#38BDF8]/50 backdrop-blur-xl transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer"
        >
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#38BDF8] flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full bg-[#03050C] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#38BDF8] group-hover:scale-110 transition-all" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold tracking-wider text-white font-['Syne',sans-serif]">
              SUYASH<span className="text-[#38BDF8]">.IO</span>
            </span>
            <span className="text-[9px] font-mono text-[#B8B8D4] -mt-0.5">
              Engineer · Designer
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav
          id="desktop-nav"
          className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#0B0F19]/85 border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                onMouseEnter={() => soundEngine.playHover()}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white bg-[#2563EB]/30 border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
                    : 'text-[#B8B8D4] hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {/* Quick mascot wave button */}
          <button
            id="wave-to-robot-btn"
            onClick={() => {
              soundEngine.playClick();
              onTriggerWave();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            title="Interact with 3D Robot Mascot"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0F19]/80 hover:bg-[#2563EB]/20 border border-white/10 hover:border-[#38BDF8]/40 text-xs font-mono text-white backdrop-blur-xl transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Say Hi!</span>
          </button>

          {/* Upload Custom 3D Model Button
          {onOpenModelModal && (
            <button
              id="nav-model-uploader-btn"
              onClick={() => {
                soundEngine.playClick();
                onOpenModelModal();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              title="Upload Custom .GLB 3D Model"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0F19]/80 hover:bg-[#38BDF8]/20 border border-white/10 hover:border-[#38BDF8]/50 text-xs font-mono text-[#B8B8D4] hover:text-white backdrop-blur-xl transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>3D Model</span>
            </button>
          )} */}

          {/* Hire Me / Contact CTA */}
          <button
            id="nav-hire-me-btn"
            onClick={() => handleNavClick('#contact')}
            onMouseEnter={() => soundEngine.playHover()}
            className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-xs font-semibold text-white transition-all duration-200 shadow-md shadow-blue-950/40 hover:shadow-lg hover:scale-105"
          >
            <Send className="w-3 h-3" />
            <span>Hire Me</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            id="mobile-menu-btn"
            onClick={() => {
              soundEngine.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="md:hidden fixed top-[4.5rem] right-5 z-[60] md:hidden p-2 rounded-full bg-[#0B0F19]/90 border border-white/10 text-white backdrop-blur-xl"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 rounded-2xl bg-[#080D1A]/95 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/80 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentSection === item.id
                  ? 'bg-[#2563EB]/25 text-white border border-[#38BDF8]/40'
                  : 'text-[#B8B8D4] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              {currentSection === item.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onTriggerWave();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white flex items-center justify-center gap-1.5"
            >
              <Bot className="w-4 h-4 text-[#38BDF8]" />
              <span>Wave Mascot</span>
            </button>
            <button
              onClick={() => handleNavClick('#contact')}
              className="flex-1 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Hire Me</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
