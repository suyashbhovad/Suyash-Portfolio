import React from 'react';
import { Award, ExternalLink, Eye, CheckCircle2 } from 'lucide-react';
import { CERTIFICATES } from '../data/portfolioData';
import { CertificateItem } from '../types';
import { soundEngine } from '../utils/audio';

interface CertificatesSectionProps {
  onSelectCertificate: (cert: CertificateItem) => void;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({ onSelectCertificate }) => {
  return (
    <section
      id="certificates"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A103D]/60 border border-[#8B5CF6]/30 backdrop-blur-xl shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Award className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 07 PROFESSIONAL CREDENTIALS
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Verified Certifications & <br />
            <span className="bg-gradient-to-r from-[#FFFFFF] via-[#8B5CF6] to-[#38BDF8] bg-clip-text text-transparent">
              Industry Credentials
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-xl leading-relaxed">
            Continuous technical validation across WebGL, cloud engineering, frontend frameworks, and design systems.
          </p>
        </div>

        {/* Certificate Cards Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CERTIFICATES.map((cert) => (
            <div
              key={cert.id}
              onMouseEnter={() => soundEngine.playHover()}
              className="group relative rounded-2xl bg-[#0B0F19]/75 hover:bg-[#0B0F19]/90 border border-white/10 hover:border-[#38BDF8]/80 backdrop-blur-[20px] overflow-hidden transform transition-all duration-300 hover:scale-[1.055] hover:-translate-y-2.5 shadow-lg shadow-black/40 hover:shadow-[0_24px_50px_rgba(56,189,248,0.35)] flex flex-col justify-between cursor-pointer"
            >
              {/* Certificate Image Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-black/40">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B24] via-[#0D0B24]/40 to-transparent" />

                {/* Lightbox Quick Inspection Button */}
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectCertificate(cert);
                  }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 text-white font-mono text-xs cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#38BDF8]" />
                  <span>Inspect Credential</span>
                </button>
              </div>

              {/* Certificate Content */}
              <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#8B5CF6] uppercase tracking-wider block">
                    {cert.issuer}
                  </span>
                  <h3 className="text-base font-bold font-['Syne',sans-serif] text-white group-hover:text-[#38BDF8] transition-colors mt-0.5">
                    {cert.title}
                  </h3>
                </div>

                {/* Skills verified */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cert.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-white/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Action Trigger */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectCertificate(cert);
                    }}
                    className="text-xs font-mono text-[#38BDF8] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Certificate</span>
                  </button>

                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundEngine.playClick()}
                    className="text-xs font-mono text-[#B8B8D4] hover:text-[#8B5CF6] flex items-center gap-1"
                    title="Official Verification"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
