import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function initSmoothScroll(): () => void {
  // Respect user's prefers-reduced-motion
  if (typeof window === 'undefined') return () => {};
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return () => {};

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });

  let rafId: number;

  function raf(time: number) {
    lenisInstance?.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(rafId);
    lenisInstance?.destroy();
    lenisInstance = null;
  };
}

export function scrollToSection(sectionId: string) {
  if (lenisInstance) {
    lenisInstance.scrollTo(sectionId, { offset: -60, duration: 1.4 });
  } else {
    const el = document.querySelector(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
