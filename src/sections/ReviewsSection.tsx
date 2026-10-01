
import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_REVIEWS } from '../data/portfolioData';
import { ReviewItem } from '../types';
import { soundEngine } from '../utils/audio';

/**
 * IMPORTANT:
 * This is a client-side admin password only.
 * It is NOT secure authentication because this code
 * is shipped to the browser.
 *
 * Change this to your own password.
 */
const ADMIN_PASSWORD = 'SuyashAdmin2026';

interface ReviewsSectionProps {
  onSuccessSubmit?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  onSuccessSubmit,
}) => {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('portfolio_reviews');

        if (saved) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        return INITIAL_REVIEWS;
      }
    }

    return INITIAL_REVIEWS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  // Stars empty initially
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingError, setRatingError] = useState(false);

  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Hidden admin state
  const [adminMode, setAdminMode] = useState(false);

  /**
   * Hidden admin shortcut:
   *
   * Ctrl + Shift + A
   *
   * This does not show any admin button to normal visitors.
   */
  useEffect(() => {
    const handleAdminShortcut = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === 'a'
      ) {
        event.preventDefault();

        if (adminMode) {
          setAdminMode(false);
          soundEngine.playClick();
          return;
        }

        const password = window.prompt('Enter admin password:');

        if (password === ADMIN_PASSWORD) {
          setAdminMode(true);
          soundEngine.playCelebration();
        } else if (password !== null) {
          soundEngine.playRoboBeep();
          window.alert('Incorrect admin password.');
        }
      }
    };

    window.addEventListener('keydown', handleAdminShortcut);

    return () => {
      window.removeEventListener('keydown', handleAdminShortcut);
    };
  }, [adminMode]);

  // Auto rotate carousel every 7 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  const handlePrev = () => {
    soundEngine.playClick();

    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, reviews.length - 1) : prev - 1
    );
  };

  const handleNext = () => {
    soundEngine.playClick();

    setCurrentIndex((prev) =>
      reviews.length > 0 ? (prev + 1) % reviews.length : 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setRatingError(true);
      soundEngine.playRoboBeep();
      return;
    }

    if (!name.trim() || !comment.trim()) return;

    soundEngine.playCelebration();

    if (onSuccessSubmit) {
      onSuccessSubmit();
    }

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Visitor / Engineer',
      company: 'Community Feedback',
      rating,
      comment: comment.trim(),
      date: 'Just now',
    };

    const updated = [newReview, ...reviews];

    setReviews(updated);
    setCurrentIndex(0);

    try {
      localStorage.setItem(
        'portfolio_reviews',
        JSON.stringify(updated)
      );
    } catch {
      // Ignore storage quota error
    }

    setSubmitted(true);
    setName('');
    setEmail('');
    setRole('');
    setRating(0);
    setHoverRating(0);
    setRatingError(false);
    setComment('');
  };

  /**
   * Delete one individual review.
   *
   * This updates both:
   * 1. React state
   * 2. localStorage
   */
  const handleDeleteReview = (reviewId: string) => {
    if (!adminMode) {
      return;
    }

    const reviewToDelete = reviews.find(
      (review) => review.id === reviewId
    );

    if (!reviewToDelete) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the review from "${reviewToDelete.name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    soundEngine.playClick();

    const updated = reviews.filter(
      (review) => review.id !== reviewId
    );

    setReviews(updated);

    // Keep carousel index valid after deletion
    setCurrentIndex((prev) => {
      if (updated.length === 0) {
        return 0;
      }

      return Math.min(prev, updated.length - 1);
    });

    try {
      localStorage.setItem(
        'portfolio_reviews',
        JSON.stringify(updated)
      );
    } catch {
      // Ignore storage errors
    }
  };

  const currentReview =
    reviews.length > 0 ? reviews[currentIndex] : null;

  return (
    <section
      id="reviews"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/40">
            <MessageSquare className="w-3.5 h-3.5 text-[#38BDF8]" />

            <span className="text-xs font-mono text-[#B8B8D4]">
              SECTION // 08 COMMUNITY TESTIMONIALS
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] text-white tracking-tight">
            Visitor & Client{' '}
            <span className="bg-gradient-to-r from-white via-[#60A5FA] to-[#38BDF8] bg-clip-text text-transparent">
              Reviews
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#B8B8D4] max-w-xl leading-relaxed">
            Real feedback from colleagues, clients, and visitors.
            Test the review engine below to broadcast your thoughts
            in real-time!
          </p>

          {/* Hidden admin status.
              Only visible after Ctrl + Shift + A + correct password. */}
          {adminMode && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />

              <span className="text-xs font-mono text-red-300">
                ADMIN MODE ACTIVE
              </span>

              <span className="text-[10px] font-mono text-white/40">
                • Ctrl + Shift + A to exit
              </span>
            </div>
          )}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Animated Review Carousel */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {currentReview ? (
              <>
                <div
                  onMouseEnter={() => soundEngine.playHover()}
                  className={`group relative min-h-[340px] p-8 sm:p-10 rounded-3xl bg-[#0B0F19]/75 border backdrop-blur-[24px] shadow-2xl shadow-black/60 transform transition-all duration-300 hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(56,189,248,0.25)] flex flex-col justify-between overflow-hidden cursor-pointer ${
                    adminMode
                      ? 'border-red-500/30 hover:border-red-400/60'
                      : 'border-white/10 hover:border-[#38BDF8]/60'
                  }`}
                >
                  {/* Admin delete button */}
                  {adminMode && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteReview(currentReview.id);
                      }}
                      className="absolute top-5 right-5 z-10 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-400/50 text-red-400 hover:text-red-300 text-xs font-mono transition-all"
                      aria-label={`Delete review from ${currentReview.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}

                  {/* Star Rating Display */}
                  <div
                    className={`flex items-center gap-1.5 mb-4 ${
                      adminMode ? 'pr-24' : ''
                    }`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < currentReview.rating
                            ? 'fill-[#F59E0B] text-[#F59E0B] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                            : 'text-white/20'
                        }`}
                      />
                    ))}

                    <span className="ml-2 text-xs font-mono text-[#F59E0B] font-semibold">
                      {currentReview.rating}.0 / 5.0
                    </span>
                  </div>

                  {/* Quote / Comment */}
                  <blockquote className="text-base sm:text-lg text-white/95 leading-relaxed italic mb-6">
                    "{currentReview.comment}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#38BDF8] flex items-center justify-center text-white font-bold font-mono text-sm shadow-md shadow-blue-900/30">
                        {currentReview.name.charAt(0)}
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-[#38BDF8] transition-colors">
                          {currentReview.name}
                        </h4>

                        <p className="text-xs font-mono text-[#38BDF8]">
                          {currentReview.role}{' '}
                          {currentReview.company
                            ? `• ${currentReview.company}`
                            : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-[#B8B8D4]">
                      {currentReview.date}
                    </span>
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <div className="flex items-center gap-2">
                    {reviews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          soundEngine.playClick();
                          setCurrentIndex(idx);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentIndex === idx
                            ? 'w-8 bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]'
                            : 'w-2 bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      onMouseEnter={() => soundEngine.playHover()}
                      className="p-2.5 rounded-xl bg-[#0B0F19]/80 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                      aria-label="Previous Review"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleNext}
                      onMouseEnter={() => soundEngine.playHover()}
                      className="p-2.5 rounded-xl bg-[#0B0F19]/80 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                      aria-label="Next Review"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty state if all reviews have been deleted */
              <div className="min-h-[340px] p-8 sm:p-10 rounded-3xl bg-[#0B0F19]/75 border border-white/10 backdrop-blur-[24px] shadow-2xl shadow-black/60 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-10 h-10 text-white/20 mb-4" />

                <h3 className="text-lg font-bold text-white">
                  No Reviews Yet
                </h3>

                <p className="text-sm text-[#B8B8D4] mt-2">
                  Be the first person to leave a review.
                </p>
              </div>
            )}
          </div>

          {/* Right: Review Submission Form Card */}
          <div
            onMouseEnter={() => soundEngine.playHover()}
            className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0B0F19]/75 border border-white/10 hover:border-[#38BDF8]/60 backdrop-blur-[24px] shadow-2xl shadow-black/60 transform transition-all duration-300 hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(56,189,248,0.25)] flex flex-col gap-5"
          >
            <div>
              <h3 className="text-xl font-bold font-['Syne',sans-serif] text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />

                <span>Leave a Review</span>
              </h3>

              <p className="text-xs text-[#B8B8D4] mt-1">
                Your feedback appears immediately in the carousel above.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 flex flex-col items-center text-center gap-3 animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-[#10B981]" />

                <h4 className="font-bold text-white text-base">
                  Review Broadcasted!
                </h4>

                <p className="text-xs text-[#B8B8D4]">
                  Thank you! Your testimonial is now visible live
                  in the carousel on the left.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSubmitted(false);
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-all cursor-pointer"
                >
                  Write Another Review
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Rating Stars Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4]">
                      Rating *
                    </label>

                    <span className="text-xs font-mono text-[#F59E0B]">
                      {rating > 0
                        ? `${rating} of 5 Stars`
                        : '(Click stars to rate)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isLit =
                        star <= (hoverRating || rating);

                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => {
                            soundEngine.playClick();
                            setRating(star);
                            setRatingError(false);
                          }}
                          onMouseEnter={() => {
                            soundEngine.playHover();
                            setHoverRating(star);
                          }}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors duration-150 ${
                              isLit
                                ? 'fill-[#F59E0B] text-[#F59E0B] drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                                : 'text-white/30 fill-transparent hover:text-white/60'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {ratingError && (
                    <div className="flex items-center gap-1.5 text-xs text-[#EF4444] font-mono mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />

                      <span>
                        Please select a star rating (1 to 5 stars)
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] block mb-1">
                    Your Name *
                  </label>

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#38BDF8] text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Role / Organization */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] block mb-1">
                    Role / Company{' '}
                    <span className="text-white/40 lowercase">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Tech Lead @ StudioLabs"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#38BDF8] text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] block mb-1">
                    Email Address{' '}
                    <span className="text-white/40 lowercase">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#38BDF8] text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B8B8D4] block mb-1">
                    Review Message *
                  </label>

                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts on the portfolio, or projects..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#38BDF8] text-sm text-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  onMouseEnter={() => soundEngine.playHover()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#38BDF8] hover:from-[#1E40AF] hover:via-[#1D4ED8] hover:to-[#0284C7] text-sm font-semibold font-mono text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 hover:shadow-xl transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />

                  <span>Publish Review</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

