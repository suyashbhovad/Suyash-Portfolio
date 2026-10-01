import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Sparkles, Printer, Eye } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

export const ResumeSection: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

 const handleDownloadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const newRipple = {
    id: Date.now(),
    x,
    y,
  };

  setRipples((prev) => [...prev, newRipple]);

  setTimeout(() => {
    setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
  }, 800);

  soundEngine.playClick();
  soundEngine.playRoboBeep();
  setIsDownloading(true);

  setTimeout(() => {
    const link = document.createElement('a');
    link.href = '/Resume2026.pdf';
    link.download = 'Suyash-Bhovad-Resume.pdf';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloading(false);
  }, 900);
};

  return (
    <section
      id="resume"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/40">
            <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 07 CURRICULUM VITAE
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Curriculum <span className="bg-gradient-to-r from-white via-[#60A5FA] to-[#38BDF8] bg-clip-text text-transparent">Vitae</span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-lg leading-relaxed">
            Download my comprehensive résumé detailing technical stacks, engineering achievements, research, and references.
          </p>
        </div>

        {/* Large Glass Card */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-[#0B0F19]/70 border border-white/10 hover:border-[#2563EB]/60 backdrop-blur-[24px] shadow-2xl shadow-black/80 transform transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center gap-8 overflow-hidden group">
          {/* Document Header Representation */}
          <div className="w-16 h-16 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-center text-[#38BDF8]">
            <FileText className="w-8 h-8 text-[#38BDF8]" />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-['Syne',sans-serif] text-white">
              {PERSONAL_INFO.name} — Resume 2026
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[#38BDF8] mt-1">
              Creative Frontend Developer • Full-Stack Engineer • UI/UX Designer
            </p>
          </div>

          {/* Highlight Grid inside Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block mb-1">
                Core Stack
              </span>
              <p className="text-xs text-white/90">
                React,Angular, Ionic, Next.js, Three.js, TypeScript, Node.js, Tailwind
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs font-mono text-[#60A5FA] uppercase tracking-wider block mb-1">
                Experience
              </span>
              <p className="text-xs text-white/90">
                Sai Service Pvt Ltd, NDS Infoserve Pvt Ltd
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider block mb-1">
                Degree
              </span>
              <p className="text-xs text-white/90">
                BSc in Information Technology (7.3 CGPA)
              </p>
            </div>
          </div>

          {/* Glowing Download Button with Ripple Animation */}
          <div className="relative mt-2">
            <button
              id="resume-download-trigger-btn"
              onClick={handleDownloadClick}
              onMouseEnter={() => soundEngine.playHover()}
              className="relative overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#38BDF8] hover:from-[#1E40AF] hover:via-[#1D4ED8] hover:to-[#0284C7] text-white font-mono font-bold text-sm tracking-wider uppercase shadow-lg shadow-blue-950/40 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3 cursor-pointer group"
            >
              {/* Animated Ripples */}
              {ripples.map((ripple) => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full bg-white/35 pointer-events-none animate-ping"
                  style={{
                    left: `${ripple.x}px`,
                    top: `${ripple.y}px`,
                    width: '40px',
                    height: '40px',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}

              <Download className={`w-5 h-5 text-white ${isDownloading ? 'animate-bounce' : 'group-hover:translate-y-0.5 transition-transform'}`} />
              <span>{isDownloading ? 'Preparing Document...' : ' Download Resume'}</span>
            </button>
          </div>

          {/* Secondary helper info */}
          <p className="text-xs font-mono text-[#B8B8D4]">
            Format: PDF • one page • Updated Sept 2026
          </p>
        </div>
      </div>
    </section>
  );
};
