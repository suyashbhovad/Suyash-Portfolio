import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    // Detect touch device
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      isTouchDevice.current = true;
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const newPos = { x: e.clientX, y: e.clientY };
      setPos(newPos);

      setTrail((prev) => {
        const next = [newPos, ...prev.slice(0, 5)];
        return next;
      });

      // Check if hovering over clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, textarea, select, [role="button"], canvas, .interactive-hover');
        setIsHovered(!!interactive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (isTouchDevice.current || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Spotlight follower */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.03) 45%, transparent 70%)',
        }}
      />

      {/* Trailing fading particles */}
      {trail.map((point, index) => {
        const opacity = (1 - (index + 1) / (trail.length + 1)) * 0.4;
        const size = Math.max(3, 8 - index * 1.2);
        return (
          <div
            key={index}
            className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
            style={{
              left: `${point.x}px`,
              top: `${point.y}px`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: '#8B5CF6',
              opacity,
            }}
          />
        );
      })}

      {/* Main outer ring */}
      <div
        className={`absolute rounded-full border pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out ${
          isHovered
            ? 'w-12 h-12 border-[#8B5CF6] bg-[#8B5CF6]/15 backdrop-blur-[1px] scale-110 shadow-[0_0_20px_rgba(139,92,246,0.6)]'
            : isClicking
            ? 'w-8 h-8 border-[#38BDF8] scale-90'
            : 'w-8 h-8 border-[#8B5CF6]/60'
        }`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
      />

      {/* Inner glowing center dot */}
      <div
        className={`absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
          isClicking ? 'scale-150 bg-[#38BDF8]' : isHovered ? 'scale-75 bg-[#8B5CF6]' : 'bg-[#FFFFFF]'
        }`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: '5px',
          height: '5px',
          boxShadow: '0 0 10px #8B5CF6, 0 0 18px #7C3AED',
        }}
      />
    </div>
  );
};
