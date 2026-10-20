import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal component: animates elements when they enter the viewport during scrolling.
 * Provides smooth spring transitions with zero third-party runtime bundle overhead.
 */
export const ScrollReveal = ({
  children,
  className = '',
  animation = 'fade-up', // 'fade-up' | 'fade-in' | 'scale-up' | 'slide-left' | 'slide-right'
  delay = 0,
  threshold = 0.12,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, keep it visible for natural reading experience
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal-box ${animation} ${isVisible ? 'is-revealed' : ''} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
