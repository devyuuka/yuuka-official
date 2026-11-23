// Refined, high-contrast 緩急 (pacing, anticipation, whip-snap, elastic settle)
// Inspired by tactile Japanese motion design: slow anticipation -> razor-sharp burst -> silky long settle.

export const EASE = {
  // Dramatic slow-start -> whip-fast mid -> crisp stop
  whip: [0.87, 0, 0.13, 1] as const,
  // Instant kinetic release -> long organic deceleration
  expoOut: [0.16, 1, 0.3, 1] as const,
  // Subtle anticipation pull -> lively overshoot -> calm rest
  backOut: [0.34, 1.48, 0.64, 1] as const,
  // Clean editorial slide
  editorial: [0.22, 1, 0.36, 1] as const,
};

export const SPRING = {
  // Crisp tactile snap with controlled bounce
  tactile: {
    type: 'spring' as const,
    stiffness: 420,
    damping: 22,
    mass: 0.75,
  },
  // Lively elastic rebound for playful moments
  elastic: {
    type: 'spring' as const,
    stiffness: 340,
    damping: 13,
    mass: 0.85,
  },
  // Silky magnetic follow
  magnetic: {
    type: 'spring' as const,
    stiffness: 380,
    damping: 26,
    mass: 0.5,
  },
};
