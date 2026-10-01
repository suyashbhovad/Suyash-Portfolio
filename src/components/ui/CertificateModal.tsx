import React from 'react';
import { X, Award, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { CertificateItem } from '../../types';
import { soundEngine } from '../../utils/audio';

interface CertificateModalProps {
  certificate: CertificateItem | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  return (
    <div
      id="certificate-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        soundEngine.playClick();
        onClose();
      }}
    >
      <div
        id="certificate-modal-card"
        className="relative w-full max-w-xl rounded-2xl bg-[#0B0F19] border border-white/10 shadow-2xl shadow-black/80 overflow-hidden text-white animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:text-[#38BDF8] hover:scale-110 transition-all cursor-pointer"
          aria-label="Close Certificate Details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Image Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-[#0F172A]/80">
          <img
            src={certificate.image}
            alt={certificate.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#2563EB]/30 border border-[#38BDF8]/50 backdrop-blur-md">
              <Award className="w-6 h-6 text-[#38BDF8]" />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Syne',sans-serif] text-white">
              {certificate.title}
            </h3>
            <p className="text-sm text-[#38BDF8] font-medium mt-1">
              Issued by {certificate.issuer}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#B8B8D4]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Issued: {certificate.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#38BDF8]">ID:</span>
              <span>{certificate.credentialId}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] mb-2 block">
              Core Competencies Verified
            </span>
            <div className="flex flex-wrap gap-2">
              {certificate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 border border-white/10 text-white flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3 text-[#10B981]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB]/20 hover:bg-[#2563EB]/35 border border-[#38BDF8]/40 text-sm font-medium text-white transition-all shadow-md shadow-blue-950/30"
            >
              <ExternalLink className="w-4 h-4 text-[#38BDF8]" />
              <span>Verify Official Credential</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
