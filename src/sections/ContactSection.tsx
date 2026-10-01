
import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Sparkles,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PERSONAL_INFO } from '../data/portfolioData';
import { soundEngine } from '../utils/audio';

interface ContactSectionProps {
  onSuccessSubmit: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  onSuccessSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PERSONAL_INFO.email);
    } catch {
      // Clipboard unavailable - nothing else required.
    }

    setCopied(true);
    soundEngine.playClick();

    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage(
        'Please fill in all required fields (Name, Email, and Message).'
      );
      soundEngine.playRoboBeep();
      return;
    }

    setErrorMessage('');
    soundEngine.playClick();
    setIsSending(true);

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || 'General Inquiry',
      message: message.trim(),
    };

    try {
     const response = await fetch('/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name,
    email,
    subject,
    message,
  }),
});

const data = await response.json().catch(() => ({}));

console.log('Contact API response:', {
  status: response.status,
  statusText: response.statusText,
  data,
});

if (!response.ok) {
  throw new Error(
    data?.error ||
    `Contact API failed with status ${response.status}`
  );
}

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error || 'Unable to transmit your message right now.'
        );
      }

      // Save locally ONLY after the email was successfully sent.
      try {
        const stored = localStorage.getItem('portfolio_contact_messages');
        const messages = stored ? JSON.parse(stored) : [];

        messages.unshift({
          id: `msg-${Date.now()}`,
          ...contactData,
          timestamp: new Date().toISOString(),
          deliveryStatus: 'sent',
        });

        localStorage.setItem(
          'portfolio_contact_messages',
          JSON.stringify(messages)
        );
      } catch (storageError) {
        console.warn(
          'Email was sent, but the local backup could not be saved:',
          storageError
        );
      }

      setIsSending(false);
      setIsSubmitted(true);

      soundEngine.playCelebration();

      if (onSuccessSubmit) {
        onSuccessSubmit();
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: [
            '#2563EB',
            '#38BDF8',
            '#1D4ED8',
            '#60A5FA',
            '#FFFFFF',
          ],
        });
      } catch {
        // Ignore confetti errors.
      }
    } catch (error) {
      console.error('Contact form error:', error);

      setIsSending(false);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Transmission failed. Please try again.'
      );

      soundEngine.playRoboBeep();
    }
  };

  const handleResetForm = () => {
    soundEngine.playClick();

    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setIsSubmitted(false);
    setErrorMessage('');
  };

  const mailtoLink = `mailto:${PERSONAL_INFO.email}?subject=${encodeURIComponent(
    subject || 'Project Inquiry from Portfolio'
  )}&body=${encodeURIComponent(
    `Hi Suyash,\n\n${message}\n\nFrom: ${name} (${email})`
  )}`;

  return (
    <section
      id="contact"
      className="relative min-h-screen w-full flex items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Reserved for 3D Robot Mascot */}
        <div className="lg:col-span-5 h-16 sm:h-64 lg:h-[550px] relative pointer-events-none flex items-center justify-center order-2 lg:order-1">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-blue-500/20 bg-radial from-blue-600/10 to-transparent blur-2xl pointer-events-none" />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2 z-10">
          {/* Section Header */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl w-fit shadow-lg shadow-black/40">
            <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 09 TRANSMISSION PROTOCOL
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Initiate Contact & <br />
            <span className="bg-gradient-to-r from-white via-[#60A5FA] to-[#38BDF8] bg-clip-text text-transparent">
              Collaborate
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-xl leading-relaxed">
            Have a project in mind, a design idea, or an interesting digital
            experience to create? Drop me a message and let’s turn the idea
            into something real.
          </p>

          {/* Direct contact chips */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={handleCopyEmail}
              onMouseEnter={() => soundEngine.playHover()}
              className="group min-h-[44px] flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0B0F19]/75 border border-white/10 hover:border-[#38BDF8]/60 text-xs font-mono text-white backdrop-blur-md transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(56,189,248,0.25)] cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{PERSONAL_INFO.email}</span>

              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#B8B8D4] group-hover:text-white transition-colors" />
              )}
            </button>

            <div className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B0F19]/75 border border-white/10 text-xs font-mono text-[#B8B8D4] backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{PERSONAL_INFO.location}</span>
            </div>
          </div>

          {/* Form Card */}
          <div
            onMouseEnter={() => soundEngine.playHover()}
            className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0B0F19]/75 border border-white/10 hover:border-[#38BDF8]/60 backdrop-blur-[24px] shadow-2xl shadow-black/60 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(56,189,248,0.25)] flex flex-col gap-6"
          >
            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 flex flex-col items-center text-center gap-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                </div>

                <h3 className="text-2xl font-bold font-['Syne',sans-serif] text-white">
                  Transmission Received!
                </h3>

                <p className="text-sm text-[#B8B8D4] max-w-md leading-relaxed">
                  Thank you for reaching out,{' '}
                  <span className="text-white font-semibold">{name}</span>!
                  Your message has been successfully transmitted. I will
                  respond to{' '}
                  <span className="text-[#38BDF8] font-mono">{email}</span>{' '}
                  shortly.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <a
                    href={mailtoLink}
                    onClick={() => soundEngine.playClick()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-xs font-mono font-semibold text-white transition-all shadow-md shadow-blue-950/40"
                  >
                    <span>Open in Email App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Send Another Signal</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs font-mono text-[#FCA5A5]">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] block mb-1">
                      Your Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="e.g. Alex Rivera"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#38BDF8] text-base sm:text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] block mb-1">
                      Email Address *
                    </label>

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="alex@techcorp.com"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#38BDF8] text-base sm:text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] block mb-1">
                    Subject
                  </label>

                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Project Inquiry / Job Opportunity / WebGL Collaboration"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#38BDF8] text-base sm:text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] block mb-1">
                    Message Details *
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Tell me about your project scope, timeline, and vision..."
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#38BDF8] text-base sm:text-sm text-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Send Button */}
                <button
                  id="contact-send-btn"
                  type="submit"
                  disabled={isSending}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="w-full min-h-[48px] py-4 rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#38BDF8] hover:from-[#1E40AF] hover:via-[#1D4ED8] hover:to-[#0284C7] text-white font-mono font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Transmitting Signal...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

