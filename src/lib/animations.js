'use client';

import { useEffect, useRef } from 'react';

// Pure CSS animation hooks - no external library needed

// Fade in animation
export const useFadeIn = (delay = 0) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.opacity = '0';
            ref.current.style.transform = 'translateY(20px)';
            ref.current.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`;
            
            requestAnimationFrame(() => {
                if (ref.current) {
                    ref.current.style.opacity = '1';
                    ref.current.style.transform = 'translateY(0)';
                }
            });
        }
    }, [delay]);

    return ref;
};

// Slide in from left
export const useSlideInLeft = (delay = 0) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.opacity = '0';
            ref.current.style.transform = 'translateX(-50px)';
            ref.current.style.transition = `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`;
            
            requestAnimationFrame(() => {
                if (ref.current) {
                    ref.current.style.opacity = '1';
                    ref.current.style.transform = 'translateX(0)';
                }
            });
        }
    }, [delay]);

    return ref;
};

// Scale up animation
export const useScaleUp = (delay = 0) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.opacity = '0';
            ref.current.style.transform = 'scale(0.8)';
            ref.current.style.transition = `opacity 0.4s ease ${delay}s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`;
            
            requestAnimationFrame(() => {
                if (ref.current) {
                    ref.current.style.opacity = '1';
                    ref.current.style.transform = 'scale(1)';
                }
            });
        }
    }, [delay]);

    return ref;
};

// Stagger children animation
export const useStaggerChildren = (stagger = 0.1) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            const children = Array.from(ref.current.children);
            children.forEach((child, i) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(20px)';
                child.style.transition = `opacity 0.4s ease ${i * stagger}s, transform 0.4s ease ${i * stagger}s`;
                
                requestAnimationFrame(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                });
            });
        }
    }, [stagger]);

    return ref;
};

// Bounce animation for notifications/badges
export const useBounce = () => {
    const ref = useRef(null);

    const trigger = () => {
        if (ref.current) {
            ref.current.style.transform = 'scale(1.2)';
            ref.current.style.transition = 'transform 0.15s ease-in-out';
            setTimeout(() => {
                if (ref.current) {
                    ref.current.style.transform = 'scale(1)';
                }
            }, 150);
        }
    };

    return { ref, trigger };
};

// Pulse animation for loading states
export const usePulse = (active = true) => {
    const ref = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (ref.current && active) {
            let opacity = 1;
            let direction = -1;
            
            intervalRef.current = setInterval(() => {
                opacity += direction * 0.05;
                if (opacity <= 0.5) direction = 1;
                if (opacity >= 1) direction = -1;
                if (ref.current) ref.current.style.opacity = String(opacity);
            }, 50);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [active]);

    return ref;
};

// Counter animation for numbers
export const animateCounter = (element, endValue, duration = 1) => {
    if (!element) return;
    const startTime = performance.now();
    
    const update = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        
        element.textContent = Math.round(eased * endValue);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    };
    
    requestAnimationFrame(update);
};

// Page transition
export const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
};
