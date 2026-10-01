import React, { useState } from 'react';
import { Cpu, Code2, Server, Terminal, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

export const SkillsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'frontend' | 'backend' | 'programming' | 'tools'>('all');

  const tabs: { key: 'all' | 'frontend' | 'backend' | 'programming' | 'tools'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'all', label: 'All Disciplines', icon: Sparkles },
    { key: 'frontend', label: 'Frontend', icon: Code2 },
    { key: 'backend', label: 'Backend', icon: Server },
    { key: 'programming', label: 'Programming', icon: Terminal },
    { key: 'tools', label: 'Tools', icon: Wrench },
  ];

  const filteredCategories = activeTab === 'all'
    ? SKILL_CATEGORIES
    : SKILL_CATEGORIES.filter((c) => c.categoryKey === activeTab);

  return (
    <section
      id="skills"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A103D]/70 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/20">
            <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 02 TECHNICAL ARSENAL
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Skills & Core <span className="bg-gradient-to-r from-[#8B5CF6] to-[#38BDF8] bg-clip-text text-transparent">Competencies</span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-2xl leading-relaxed">
            A comprehensive matrix of modern frameworks, system programming languages, and design tools engineered for high-performance software and 3D web experiences.
          </p>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab(tab.key);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className={`flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2 min-h-[44px] rounded-full text-xs font-mono font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-[#B8B8D4] hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills Cards Grid */}
        <div className="flex flex-col gap-10">
          {filteredCategories.map((category) => (
            <div key={category.categoryKey} className="flex flex-col gap-4">
              {/* Category Subtitle */}
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_6px_#8B5CF6]" />
                <h3 className="text-lg font-bold font-['Syne',sans-serif] text-white uppercase tracking-wider">
                  {category.title}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-white/15 to-transparent" />
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.skills.map((skill) => (
                  <div
                    key={skill.name}
                    onMouseEnter={() => soundEngine.playHover()}
                    className={`group relative p-5 rounded-2xl bg-[#0B0F19]/75 hover:bg-[#0B0F19]/90 border backdrop-blur-[20px] transform-gpu transition-all duration-300 hover:scale-[1.06] hover:-translate-y-2 shadow-lg shadow-black/40 hover:shadow-[0_18px_36px_rgba(56,189,248,0.3)] cursor-pointer ${
                      skill.highlight
                        ? 'border-[#38BDF8]/50 hover:border-[#38BDF8]'
                        : 'border-white/10 hover:border-[#38BDF8]/60'
                    }`}
                  >
                    {/* Top Row: Name and Level */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${skill.highlight ? 'text-[#38BDF8]' : 'text-[#8B5CF6]'}`} />
                        <h4 className="font-semibold text-white text-base group-hover:text-[#38BDF8] transition-colors">
                          {skill.name}
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-[#8B5CF6] font-bold">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#B8B8D4] leading-relaxed mb-4 min-h-[32px]">
                      {skill.description}
                    </p>

                    {/* Proficiency Progress Bar */}
                  <div className="relative w-full h-2 rounded-full bg-black/50 border border-white/10 overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#38BDF8] transition-[width] duration-700 ease-out"
                      style={{
                        width: `${Math.max(0, Math.min(100, skill.level))}%`,
                      }}
                    />
                  </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
