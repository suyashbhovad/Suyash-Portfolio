/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SectionId, Project, CertificateItem } from './types';
import { initSmoothScroll } from './utils/smoothScroll';
import { soundEngine } from './utils/audio';

// Canvas 3D Components
import { BackgroundCanvas } from './components/canvas/BackgroundCanvas';
import { RobotCanvas } from './components/canvas/RobotCanvas';

// UI Components
import { Navbar } from './components/ui/Navbar';
import { AudioController } from './components/ui/AudioController';
import { ProjectModal } from './components/ui/ProjectModal';
import { CertificateModal } from './components/ui/CertificateModal';
import { ModelUploaderModal } from './components/ui/ModelUploaderModal';

// Portfolio Sections
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { SkillsSection } from './sections/SkillsSection';
import { ServicesSection } from './sections/ServicesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { CertificatesSection } from './sections/CertificatesSection';
import { ResumeSection } from './sections/ResumeSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { ContactSection } from './sections/ContactSection';
import { FooterSection } from './sections/FooterSection';

export default function App() {
  const [currentSection, setCurrentSection] = useState<SectionId>('hero');
  const [isWaving, setIsWaving] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [floatingMode, setFloatingMode] = useState(true);

  // Modals state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<number | null>(null);

  // 1. Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const cleanupScroll = initSmoothScroll();
    return () => {
      cleanupScroll();
    };
  }, []);

  // 2. Track Active Section & Scroll Direction
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (Math.abs(diff) > 4) {
        setScrollDirection(diff > 0 ? 'down' : 'up');
      }

      lastScrollY.current = currentY;

      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = window.setTimeout(() => {
        setScrollDirection('idle');
      }, 350);

      // Section detection in exact DOM visual order top to bottom
      const sections: SectionId[] = [
        'hero',
        'about',
        'skills',
        'experience',
        'projects',
        'services',
        'education',
        'certificates',
        'resume',
        'reviews',
        'contact',
      ];

      const scrollPosition = currentY + window.innerHeight * 0.38;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setCurrentSection(sections[i]);
            break;
          }
        }
      }

      // Check if near bottom for footer
      const documentHeight = document.documentElement.scrollHeight;
      if (currentY + window.innerHeight >= documentHeight - 200) {
        setCurrentSection('footer' as unknown as SectionId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Trigger robot wave
  const handleTriggerWave = () => {
    setIsWaving(true);
    soundEngine.playRoboBeep();
    setTimeout(() => setIsWaving(false), 2000);
  };

  // Trigger robot happy celebration (on contact submission or review)
  const handleTriggerHappy = () => {
    setIsHappy(true);
    setIsWaving(true);
    soundEngine.playCelebration();
    setTimeout(() => {
      setIsHappy(false);
      setIsWaving(false);
    }, 5000);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020308] text-white selection:bg-[#2563EB]/40 selection:text-white">
      {/* 3D Cosmic Background Particle Field & Grid */}
      <BackgroundCanvas />

      {/* 3D Mascot Canvas (Fixed Viewport with Section Tracking & Walk-in Transitions) */}
      <RobotCanvas
        currentSection={currentSection}
        isWaving={isWaving}
        isHappy={isHappy}
        onInteract={handleTriggerWave}
        scrollDirection={scrollDirection}
        customModelUrl={customModelUrl}
        floatingMode={floatingMode}
      />

      {/* Floating Companion Control Pill for Content Sections */}
      {[
        'skills',
        'experience',
        'projects',
        'services',
        'education',
        'certificates',
        'resume',
        'reviews',
      ].includes(currentSection) && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 flex items-center gap-2">
          <button
            id="companion-dock-toggle"
            onClick={() => {
              setFloatingMode(prev => !prev);
              soundEngine.playClick();
            }}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-[#0B0F19]/90 hover:bg-[#0F172A] border border-white/10 hover:border-[#38BDF8]/40 backdrop-blur-md shadow-lg shadow-black/60 text-xs font-mono text-white/90 transition-all duration-300 group cursor-pointer max-w-[calc(100vw-32px)]"
            title={floatingMode ? 'Park LAP1 in wings to clear view' : 'Summon LAP1 to float in corner'}
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors shrink-0 ${
                floatingMode ? 'bg-[#4ADE80] animate-pulse' : 'bg-[#B8B8D4]/40'
              }`}
            />
            <span className="text-[11px] hidden sm:inline">
              {floatingMode ? 'LAP1 Floating in Corner' : 'LAP1 Parked in Wings (Clean View)'}
            </span>
            <span className="text-[11px] sm:hidden truncate">
              {floatingMode ? 'LAP1 Active' : 'LAP1 Parked'}
            </span>
            <span className="text-[10px] text-[#38BDF8] font-semibold group-hover:underline shrink-0">
              {floatingMode ? '[Park]' : '[Summon]'}
            </span>
          </button>
        </div>
      )}

      {/* Top Right Sound Controller (Mute, Volume slider, Drone) */}
      <AudioController />

      {/* Top Floating Glassmorphism Navigation */}
      <Navbar
        currentSection={currentSection}
        onTriggerWave={handleTriggerWave}
        onOpenModelModal={() => setIsModelModalOpen(true)}
      />

      {/* Content Sections */}
      <main className="relative z-10 flex flex-col w-full">
        {/* Hero Section */}
        <HeroSection onTriggerWave={handleTriggerWave} />

        {/* About Section */}
        <AboutSection />

        {/* Skills Section */}
        <SkillsSection />

        {/* Experience Section (Timeline) - Exchanged with Services */}
        <ExperienceSection />

        {/* Projects Section */}
        <ProjectsSection onSelectProject={(project) => setSelectedProject(project)} />

        {/* Services Section - Exchanged with Experience */}
        <ServicesSection />

        {/* Education Section */}
        <EducationSection />

        {/* Certificates Section */}
        {/* <CertificatesSection onSelectCertificate={(cert) => setSelectedCertificate(cert)} /> */}

        {/* Resume Section */}
        <ResumeSection />

        {/* Reviews Section */}
        <ReviewsSection onSuccessSubmit={handleTriggerHappy} />

        {/* Contact Section */}
        <ContactSection onSuccessSubmit={handleTriggerHappy} />

        {/* Footer Section */}
        <FooterSection
          onTriggerWave={handleTriggerWave}
          onOpenModelModal={() => setIsModelModalOpen(true)}
        />
      </main>

      {/* Lightbox Modals */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <CertificateModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />

      <ModelUploaderModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onModelLoaded={(url) => {
          setCustomModelUrl(url);
          handleTriggerHappy();
        }}
      />
    </div>
  );
}
