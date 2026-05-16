import React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

/**
 * Reveal — wraps children in a framer-motion element that animates on
 * scroll-into-view with a slow, soft entrance. Use as a drop-in for any block
 * that should appear gently as the user scrolls down.
 */
export const Reveal = ({
  children,
  delay = 0,
  variants = fadeUp,
  amount = 0.2,
  className = "",
  as = "div",
  testId,
}) => {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      data-testid={testId}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
};

export default Reveal;
