import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const scrollTrack = {
  y: 0,
  velocity: 0,
  progress: 0,
};

let lenisInstance: Lenis | null = null;

export function scrollToTarget(target: string | number, duration = 1.15) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      duration,
      // Extreme whip-snap 緩急 easing (slow start -> hyper-fast glide -> sharp brake)
      easing: (t) =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
    });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }
}

export function useLenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.35,
    });

    lenisInstance = lenis;

    lenis.on('scroll', (e: { scroll: number; velocity: number; progress: number }) => {
      scrollTrack.y = e.scroll;
      scrollTrack.velocity = e.velocity;
      scrollTrack.progress = e.progress;
      ScrollTrigger.update();
    });

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}
