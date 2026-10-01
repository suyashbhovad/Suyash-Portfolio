import React from 'react';
import { History, Briefcase, MapPin, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { EXPERIENCES, PERSONAL_INFO } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';
import { scrollToSection } from '../utils/smoothScroll';

export const ExperienceSection: React.FC = () => {
  return (
    <section
      id="experience"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-5xl w-full mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/40">
            <History className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 03 TIMELINE & CAREER TRAJECTORY
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Work Experience & <br />
            <span className="bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-white bg-clip-text text-transparent">
              Career Trajectory
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-xl leading-relaxed">
            Hands-on track record building production web architectures, creative agency platforms, and software solutions.
          </p>

          {/* Mandated Banner: "Open to Internship and Full-Time Opportunities" */}
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-black/20">
            <Sparkles className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs sm:text-sm font-mono font-semibold text-white">
              {PERSONAL_INFO.availability}
            </span>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-[#2563EB]/40 ml-4 sm:ml-8 pl-6 sm:pl-10 flex flex-col gap-10">
          {EXPERIENCES.map((exp) => (
            <div key={exp.id} className="relative">
              {/* Static Timeline Node on Left Axis: Never scales or translates on card hover */}
              <div className="absolute -left-[33px] sm:-left-[49px] top-8 w-4 h-4 rounded-full bg-[#03050C] border-2 border-[#2563EB] flex items-center justify-center pointer-events-none z-10 shadow-[0_0_8px_rgba(37,99,235,0.5)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              </div>

              {/* Card Container: Receives distinct scaled up hover effect without moving the timeline node */}
              <div
                onMouseEnter={() => soundEngine.playHover()}
                className="group relative p-6 sm:p-8 rounded-2xl bg-[#0B0F19]/75 border border-white/10 hover:border-[#38BDF8]/80 backdrop-blur-[20px] transform transition-all duration-300 hover:scale-[1.045] hover:-translate-y-2 shadow-lg shadow-black/50 hover:shadow-[0_24px_50px_rgba(56,189,248,0.35)] hover:bg-[#0B0F19]/90 cursor-pointer"
              >
                {/* Header: Role & Period */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#38BDF8]" />
                    <h3 className="text-xl sm:text-2xl font-bold font-['Syne',sans-serif] text-white group-hover:text-[#38BDF8] transition-colors">
                      {exp.role}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#1D4ED8]/25 border border-[#38BDF8]/40 text-white shadow-sm">
                    <Calendar className="w-3 h-3 text-[#38BDF8]" />
                    <span>{exp.period}</span>
                  </div>
                </div>

                {/* Company & Location */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#38BDF8] mb-4">
                  <span className="font-semibold text-white/90">{exp.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#B8B8D4]">
                    <MapPin className="w-3 h-3 text-[#B8B8D4]" />
                    {exp.location}
                  </span>
                  {exp.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      Current Position
                    </span>
                  )}
                </div>

                {/* Description Bullets */}
                <ul className="flex flex-col gap-2 mb-6">
                  {exp.description.map((desc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#B8B8D4] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  {exp.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 border border-white/10 text-white/90 group-hover:border-[#38BDF8]/30 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Direct CTA to Hire / Collaborate */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B0F19]/80 via-[#1D4ED8]/20 to-[#0B0F19]/80 border border-[#2563EB]/40 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h4 className="text-base font-bold font-['Syne',sans-serif] text-white">
                Interested in working together?
              </h4>
              <p className="text-xs text-[#B8B8D4] mt-0.5">
                I am actively considering innovative full-time roles and high-impact internships.
              </p>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                scrollToSection('#contact');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-xs font-semibold font-mono text-white transition-all shadow-md shadow-blue-900/40 whitespace-nowrap cursor-pointer hover:scale-105"
            >
              Get In Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
