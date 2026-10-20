import { useEffect, useState } from 'react';

/**
 * High-performance passive scroll hook for multi-plane parallax depth.
 * Uses requestAnimationFrame to prevent scroll jank and keep transforms at 60/120 FPS.
 */
export function useParallax() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset;
      const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalDocHeight > 0 ? Math.min(1, Math.max(0, currentScrollY / totalDocHeight)) : 0;

      setScrollY(currentScrollY);
      setScrollProgress(progress);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { scrollY, scrollProgress };
}

export default useParallax;
