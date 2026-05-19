import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const cardHover: Variants = {
  initial: { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: { 
    y: -4, 
    boxShadow: "0 10px 20px -10px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 300, damping: 20 } 
  },
};

export const buttonClick = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const TRANSITION_DEFAULTS = {
  duration: 0.3,
  ease: "easeOut",
};
