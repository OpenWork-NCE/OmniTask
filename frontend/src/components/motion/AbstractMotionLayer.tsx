import { motion, useReducedMotion } from "framer-motion";

import eclipseDark from "@/assets/overlays/eclipse-dark.svg";
import eclipseLight from "@/assets/overlays/eclipse-light.svg";
import horizonDark from "@/assets/overlays/horizon-dark.svg";
import horizonLight from "@/assets/overlays/horizon-light.svg";
import matrixDark from "@/assets/overlays/matrix-dark.svg";
import matrixLight from "@/assets/overlays/matrix-light.svg";

type AbstractMotionLayerProps = Readonly<{
  variant: "eclipse" | "horizon" | "matrix";
}>;

const sources = {
  eclipse: { light: eclipseLight, dark: eclipseDark },
  horizon: { light: horizonLight, dark: horizonDark },
  matrix: { light: matrixLight, dark: matrixDark }
} as const;

export function AbstractMotionLayer({ variant }: AbstractMotionLayerProps) {
  const reduceMotion = useReducedMotion();
  const source = sources[variant];
  const movement = reduceMotion
    ? {}
    : {
        x: [0, 12, 0],
        y: [0, -8, 0],
        scale: [1.02, 1.045, 1.02]
      };

  return (
    <div aria-hidden className={`abstract-motion-layer abstract-motion-layer-${variant}`}>
      <motion.img
        alt=""
        animate={movement}
        className="abstract-motion-image dark:hidden"
        src={source.light}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.img
        alt=""
        animate={movement}
        className="abstract-motion-image hidden dark:block"
        src={source.dark}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
}
