import React, { useState, useRef } from 'react';
import { Layers, ExternalLink, Github, Sparkles, Eye } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import { Project } from '../types';
import { soundEngine } from '../utils/audio';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

// Interactive 3D tilt card component
const ProjectTiltCard: React.FC<{
  project: Project;
  onSelect: (project: Project) => void;
}> = ({ project, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;
    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundEngine.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.055 : 1}, ${isHovered ? 1.055 : 1}, 1)`,
        transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.4s ease-in-out',
      }}
      className="group relative rounded-2xl bg-[#0B0F19]/75 border border-white/10 hover:border-[#38BDF8]/80 backdrop-blur-[20px] shadow-xl shadow-black/60 hover:shadow-[0_24px_50px_rgba(56,189,248,0.35)] overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      {/* Project Card Image Banner */}
      <div className="relative h-52 w-full overflow-hidden bg-black/40">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020308] via-transparent to-transparent opacity-90" />

        {/* Category & Metrics badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-[#1D4ED8]/40 border border-[#38BDF8]/50 text-white backdrop-blur-md">
            {project.category}
          </span>
          {project.metrics && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {project.metrics}
            </span>
          )}
        </div>

        {/* Quick View Trigger on Image Hover */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onSelect(project);
          }}
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 text-white font-mono text-xs cursor-pointer"
        >
          <Eye className="w-4 h-4 text-[#38BDF8]" />
          <span>Inspect Architecture</span>
        </button>
      </div>

      {/* Card Information */}
      <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
        <div>
          <h3 className="text-xl font-bold font-['Syne',sans-serif] text-white group-hover:text-[#38BDF8] transition-colors">
            {project.title}
          </h3>
          <p className="text-xs font-mono text-[#38BDF8] mt-0.5">
            {project.subtitle}
          </p>
          <p className="text-xs sm:text-sm text-[#B8B8D4] leading-relaxed mt-2 line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 border border-white/10 text-white/90"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-[#B8B8D4]">
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              soundEngine.playClick();
              onSelect(project);
            }}
            className="text-xs font-mono text-[#38BDF8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          <div className="flex items-center gap-2">
            {/* <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#B8B8D4] hover:text-white transition-all"
              title="View GitHub Repository"
              aria-label={`View GitHub repository for ${project.title}`}
            >
              <Github className="w-3.5 h-3.5" />
            </a> */}

            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-xs font-medium text-white transition-all shadow-md shadow-blue-950/40"
            >
              <span>Live</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const [filter, setFilter] = useState<'All' | Project['category']>('All');

  const categories: ('All' | Project['category'])[] = [
    'All',
    'Mobile Development',
    'Web Development',
    'Mobile & Web',
    'UI/UX Design',
  ];

  const filteredProjects =
    filter === 'All'
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === filter);

  return (
    <section
      id="projects"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-12">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/40">
            <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />

            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 04 FEATURED WORKS
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Selected{' '}
            <span className="bg-gradient-to-r from-white via-[#60A5FA] to-[#38BDF8] bg-clip-text text-transparent">
              Creations
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-2xl leading-relaxed">
            A collection of web and mobile applications built with a focus on
            practical functionality, responsive interfaces, and thoughtful
            digital experiences.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundEngine.playClick();
                  setFilter(cat);
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className={`px-3.5 py-2 sm:px-4 sm:py-1.5 min-h-[44px] flex items-center justify-center rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                  filter === cat
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-950/40 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-[#B8B8D4] hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectTiltCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
