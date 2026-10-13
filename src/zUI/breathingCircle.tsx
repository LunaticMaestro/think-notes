
import { motion } from "motion/react";

type BreathingCircleProps = {
  size?: number;
};

export function BreathingCircle({
  size = 80,
}: BreathingCircleProps) {
  return (
      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{
          duration: .9,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      />
  );
}
