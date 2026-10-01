import React from 'react';
import { User, Compass, Cpu, Palette, BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative min-h-screen w-full flex items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Reserved for 3D Mascot Canvas (Mascot moves to LEFT in About) */}
        <div className="lg:col-span-5 h-16 sm:h-64 lg:h-[550px] relative pointer-events-none flex items-center justify-center order-2 lg:order-1">
          {/* Subtle ambient halo spotlight */}
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-[#38BDF8]/20 bg-radial from-[#38BDF8]/10 to-transparent blur-2xl pointer-events-none" />
        </div>

        {/* Right Column: Glassmorphic About Card & Story (Text on RIGHT in About) */}
        <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2 z-10">
          {/* Section Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A103D]/70 border border-white/10 backdrop-blur-xl w-fit shadow-lg shadow-black/20">
            <User className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 01 ABOUT ME
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Engineering Meets <br />
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#38BDF8] to-[#FFFFFF] bg-clip-text text-transparent">
              Art & Design
            </span>
          </h2>

          {/* Primary Glassmorphic Card */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-[20px] shadow-2xl shadow-black/50 flex flex-col gap-6 relative overflow-hidden">
            {/* Top quote as explicitly mandated by user */}
            <blockquote className="p-4 rounded-xl bg-[#1A103D]/50 border-l-4 border-[#8B5CF6] text-sm sm:text-base italic text-white/90 leading-relaxed font-sans shadow-md shadow-black/20">
              "I'm a passionate Web Developer and Software Engineer exploring UI/UX Design while building immersive web experiences."
            </blockquote>

            {/* Grid of details: Who I am, Journey, Currently learning, Interests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Who I Am */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#38BDF8]/60 transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2 shadow-md shadow-black/20 hover:shadow-[0_16px_36px_rgba(56,189,248,0.25)] cursor-pointer">
                <div className="flex items-center gap-2 text-[#38BDF8] mb-2">
                  <User className="w-4 h-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
                    Who I Am
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#B8B8D4] leading-relaxed">
                  A Software Engineer exploring the world of UI/UX, graphic design, and visual storytelling, bringing ideas to life through code and creativity.
                </p>
              </div>

              {/* Journey */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#38BDF8]/60 transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2 shadow-md shadow-black/20 hover:shadow-[0_16px_36px_rgba(56,189,248,0.25)] cursor-pointer">
                <div className="flex items-center gap-2 text-[#8B5CF6] mb-2">
                  <Compass className="w-4 h-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
                    My Journey
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#B8B8D4] leading-relaxed">
                From PHP to Angular and Ionic, I'm a Software Engineer passionate about frontend development, visual design, and building meaningful digital experiences.
                </p>
              </div>

              {/* Currently Learning */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#38BDF8]/60 transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2 shadow-md shadow-black/20 hover:shadow-[0_16px_36px_rgba(56,189,248,0.25)] cursor-pointer">
                <div className="flex items-center gap-2 text-[#10B981] mb-2">
                  <BookOpen className="w-4 h-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
                    Currently Learning
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#B8B8D4] leading-relaxed">
                  Exploring UI/UX design, motion graphics, typography, branding, and print through personal projects and creative experimentation.
                </p>
              </div>

              {/* Interests & Hobbies */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#38BDF8]/60 transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2 shadow-md shadow-black/20 hover:shadow-[0_16px_36px_rgba(56,189,248,0.25)] cursor-pointer">
                <div className="flex items-center gap-2 text-[#F59E0B] mb-2">
                  <Palette className="w-4 h-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">
                    Interests
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#B8B8D4] leading-relaxed">
                  UI/UX Design, Visual Arts, Branding, Typography, Printmaking, Packaging Design, Motion Graphics, and Creative Web Experiences.
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
              {/* <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-['Syne',sans-serif] text-white">
                  3+
                </span>
                <p className="text-[11px] font-mono text-[#B8B8D4] uppercase mt-0.5">
                  Years Crafting
                </p>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-['Syne',sans-serif] text-[#8B5CF6]">
                  15+
                </span>
                <p className="text-[11px] font-mono text-[#B8B8D4] uppercase mt-0.5">
                  Projects Shipped
                </p>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold font-['Syne',sans-serif] text-[#38BDF8]">
                  60 FPS
                </span>
                <p className="text-[11px] font-mono text-[#B8B8D4] uppercase mt-0.5">
                  Fluid Renders
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
