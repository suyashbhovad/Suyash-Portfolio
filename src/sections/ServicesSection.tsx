import React from 'react';
import { 
  Briefcase, 
  Code2, 
  Smartphone, 
  Layout, 
  Server, 
  Palette, 
  Sparkles, 
  Globe, 
  Zap, 
  ArrowRight, 
  Check 
} from 'lucide-react';
import { SERVICES } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';
import { scrollToSection } from '../utils/smoothScroll';

export const ServicesSection: React.FC = () => {
  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    Code2,
    Smartphone,
    Layout,
    Server,
    Palette,
    Sparkles,
    Globe,
    Zap,
  };

  return (
    <section
      id="services"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/40">
            <Briefcase className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 05 CAPABILITIES & SERVICES
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Specialized Engineering & <br />
            <span className="bg-gradient-to-r from-white via-[#60A5FA] to-[#38BDF8] bg-clip-text text-transparent">
              Creative Services
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-2xl leading-relaxed">
            Delivering bespoke end-to-end digital solutions from high-fidelity UX prototypes to scalable full-stack architectures and cinematic 3D web experiences.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon] || Code2;
            return (
              <div
                key={service.id}
                onMouseEnter={() => soundEngine.playHover()}
                className="group relative p-6 rounded-2xl bg-[#0B0F19]/75 hover:bg-[#0B0F19]/90 border border-white/10 hover:border-[#38BDF8]/80 backdrop-blur-[20px] transform transition-all duration-300 hover:scale-[1.055] hover:-translate-y-2.5 shadow-lg shadow-black/40 hover:shadow-[0_24px_50px_rgba(56,189,248,0.35)] flex flex-col justify-between cursor-pointer"
              >
                {/* Subtle corner accent on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#2563EB]/10 to-transparent rounded-tr-2xl pointer-events-none group-hover:from-[#2563EB]/20 transition-all" />

                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 group-hover:border-[#2563EB] group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#B8B8D4]">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold font-['Syne',sans-serif] text-white group-hover:text-[#38BDF8] transition-colors mb-2">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8B8D4] leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Deliverables checklist */}
                  <div className="flex flex-col gap-1.5 mb-6 pt-3 border-t border-white/5">
                    {service.deliverables.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-white/80">
                        <Check className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct CTA */}
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    scrollToSection('#contact');
                  }}
                  className="flex items-center justify-between w-full pt-3 border-t border-white/10 text-xs font-mono text-[#38BDF8] group-hover:text-white transition-colors cursor-pointer"
                >
                  <span>Request Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
