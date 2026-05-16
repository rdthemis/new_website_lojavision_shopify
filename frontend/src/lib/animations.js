// Framer Motion variants for slow-motion entrance.
// Easing: cubic-bezier(0.16, 1, 0.3, 1) — soft, premium feel.

export const EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: EASE },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: EASE } },
};

export const stagger = (delayChildren = 0.1, staggerChildren = 0.2) => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

export const wordRise = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: EASE },
  },
};

export const kenBurns = {
  initial: { scale: 1.12, opacity: 0 },
  animate: { scale: 1.0, opacity: 1 },
};
