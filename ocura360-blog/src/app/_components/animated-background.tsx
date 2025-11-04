"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function AnimatedBackground() {
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to color values
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      "rgb(249, 250, 251)", // gray-50
      "rgb(239, 246, 255)", // blue-50
      "rgb(245, 243, 255)", // purple-50
      "rgb(254, 242, 242)", // red-50
      "rgb(236, 253, 245)", // green-50
    ]
  );

  return (
    <motion.div
      className="fixed inset-0 -z-10"
      style={{ backgroundColor }}
    />
  );
}
