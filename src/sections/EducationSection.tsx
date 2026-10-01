import React from 'react';
import { GraduationCap, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { EDUCATIONS } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

export const EducationSection: React.FC = () => {
  return (
    <section
      id="education"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-5xl w-full mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A103D]/60 border border-[#8B5CF6]/30 backdrop-blur-xl shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <GraduationCap className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 06 ACADEMIC FOUNDATION
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Education & <span className="bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] bg-clip-text text-transparent">Degrees</span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-xl leading-relaxed">
            Formal computer science fundamentals, engineering principles, algorithms, and honors achievements.
          </p>
        </div>

        {/* Education Timeline Cards */}
        <div className="relative border-l-2 border-[#38BDF8]/40 ml-4 sm:ml-8 pl-6 sm:pl-10 flex flex-col gap-8">
          {EDUCATIONS.map((edu) => (
            <div key={edu.id} className="relative">
              {/* Static Timeline Node: Stays locked to timeline axis */}
              <div className="absolute -left-[33px] sm:-left-[49px] top-8 w-4 h-4 rounded-full bg-[#03050C] border-2 border-[#38BDF8] flex items-center justify-center pointer-events-none z-10 shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              </div>

              {/* Card Container: Distinct scaled up hover effect strictly on the card */}
              <div
                onMouseEnter={() => soundEngine.playHover()}
                className="group relative p-6 sm:p-8 rounded-2xl bg-[#0B0F19]/75 border border-white/10 hover:border-[#38BDF8]/80 backdrop-blur-[20px] transform transition-all duration-300 hover:scale-[1.045] hover:-translate-y-2 shadow-lg shadow-black/40 hover:shadow-[0_24px_50px_rgba(56,189,248,0.35)] hover:bg-[#0B0F19]/90 cursor-pointer"
              >
                {/* Degree Title & Period */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold font-['Syne',sans-serif] text-white group-hover:text-[#38BDF8] transition-colors">
                    {edu.degree}
                  </h3>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#1D4ED8]/25 border border-[#38BDF8]/40 text-white shadow-sm">
                    <Calendar className="w-3 h-3 text-[#38BDF8]" />
                    <span>{edu.period}</span>
                  </div>
                </div>

                {/* Institution & Grade */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#38BDF8] mb-4">
                  <span className="font-semibold text-white/90">{edu.institution}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
                    <Award className="w-3 h-3" />
                    {edu.grade}
                  </span>
                </div>

                {/* Highlights */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  {edu.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#B8B8D4] leading-relaxed list-none">
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
