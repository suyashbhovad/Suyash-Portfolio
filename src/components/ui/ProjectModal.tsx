import React from 'react';
import { X, ExternalLink, Github, Sparkles, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';
import { soundEngine } from '../../utils/audio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div
      id="project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        soundEngine.playClick();
        onClose();
      }}
    >
      <div
        id="project-modal-card"
        className="relative w-full max-w-2xl rounded-2xl bg-[#0D0B24] border border-[#8B5CF6]/40 shadow-[0_0_50px_rgba(139,92,246,0.3)] overflow-hidden text-white animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:text-[#8B5CF6] hover:scale-110 transition-all"
          aria-label="Close Project Details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Project Header Image */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B24] via-transparent to-black/40" />

          {/* Badge & Category */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#8B5CF6]/30 border border-[#8B5CF6]/50 text-white backdrop-blur-md">
              {project.category}
            </span>
            {project.metrics && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {project.metrics}
              </span>
            )}
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-['Syne',sans-serif] text-white">
              {project.title}
            </h3>
            <p className="text-sm text-[#8B5CF6] font-mono mt-1">
              {project.subtitle}
            </p>
          </div>

          <p className="text-[#B8B8D4] text-sm sm:text-base leading-relaxed">
            {project.longDescription}
          </p>

          {/* Tech stack pills */}
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] mb-2 block">
              Engineered With
            </span>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-white flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#38BDF8]" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action links */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-sm font-medium text-white shadow-lg shadow-blue-950/40 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live Demonstration</span>
            </a>

            {/* <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-sm font-medium text-white transition-all"
            >
              <Github className="w-4 h-4" />
              <span>View Source Code</span>
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
};
