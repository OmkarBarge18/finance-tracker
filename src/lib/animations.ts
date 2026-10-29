import gsap from 'gsap';
import anime from 'animejs';
import confetti from 'canvas-confetti';

// Check if user prefers reduced motion
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animate a numeric value using Anime.js with easing and collision prevention
 */
export function animateValue({
  targetRef,
  startValue = 0,
  endValue,
  duration = 900,
  prefix = '$',
  decimals = 2,
}: {
  targetRef: HTMLElement | null;
  startValue?: number;
  endValue: number;
  duration?: number;
  prefix?: string;
  decimals?: number;
}) {
  if (!targetRef) return;

  if (prefersReducedMotion()) {
    targetRef.textContent = `${prefix}${endValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
    return;
  }

  // Cancel any ongoing anime animations on this object
  const obj = { val: startValue };
  anime.remove(obj);

  anime({
    targets: obj,
    val: endValue,
    round: decimals === 0 ? 1 : 100,
    easing: 'easeOutQuart',
    duration: duration,
    update: () => {
      if (targetRef) {
        const formatted = obj.val.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        targetRef.textContent = `${prefix}${formatted}`;
      }
    },
  });
}

/**
 * GSAP staggered entrance animation for child elements with reduced motion check
 */
export function staggerEntrance(
  selector: string | HTMLElement[] | NodeListOf<Element>,
  delay: number = 0.04
) {
  if (typeof window === 'undefined') return;

  if (prefersReducedMotion()) {
    gsap.set(selector, { opacity: 1, y: 0, scale: 1 });
    return;
  }

  gsap.fromTo(
    selector,
    {
      opacity: 0,
      y: 18,
      scale: 0.985,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: delay,
      ease: 'power2.out',
      clearProps: 'transform',
    }
  );
}

/**
 * Anime.js spring animation for button clicks or interactive elements
 */
export function springPress(element: HTMLElement | null) {
  if (!element || prefersReducedMotion()) return;

  anime.remove(element);
  anime({
    targets: element,
    scale: [1, 0.94, 1.02, 1],
    duration: 280,
    easing: 'spring(1, 95, 14, 0)',
  });
}

/**
 * Anime.js progress bar elastic fill
 */
export function animateProgressBar(
  element: HTMLElement | null,
  targetPercent: number,
  duration: number = 800
) {
  if (!element) return;
  const clamped = Math.min(Math.max(targetPercent, 0), 100);

  if (prefersReducedMotion()) {
    element.style.width = `${clamped}%`;
    return;
  }

  anime.remove(element);
  anime({
    targets: element,
    width: `${clamped}%`,
    duration: duration,
    easing: 'easeOutCubic',
  });
}

/**
 * GSAP 3D hover tilt effect with requestAnimationFrame throttling to avoid layout thrashing
 */
export function initCardTilt(card: HTMLElement) {
  if (!card || prefersReducedMotion()) return () => {};

  let rafId: number | null = null;
  let mouseX = 0;
  let mouseY = 0;

  const handleMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.35,
          ease: 'power1.out',
          transformPerspective: 1000,
          overwrite: 'auto',
        });
        rafId = null;
      });
    }
  };

  const handleMouseLeave = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  card.addEventListener('mousemove', handleMouseMove, { passive: true });
  card.addEventListener('mouseleave', handleMouseLeave, { passive: true });

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    card.removeEventListener('mousemove', handleMouseMove);
    card.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * Trigger celebratory confetti burst with safety check
 */
export function triggerConfetti() {
  if (prefersReducedMotion()) return;
  try {
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#6366f1', '#38bdf8', '#fbbf24', '#f43f5e'],
      disableForReducedMotion: true,
    });
  } catch {
    // safe fallback
  }
}

/**
 * Anime.js pulse ripple effect
 */
export function animatePulse(element: HTMLElement | null) {
  if (!element || prefersReducedMotion()) return;
  anime.remove(element);
  anime({
    targets: element,
    scale: [1, 1.06, 1],
    opacity: [0.85, 1, 0.85],
    duration: 1600,
    loop: true,
    easing: 'easeInOutSine',
  });
}
