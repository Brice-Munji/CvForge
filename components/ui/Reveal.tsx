"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const easing = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered fade + upward reveal. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  as = "div",
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.6, ease: easing, delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggered container — children using RevealItem animate in sequence.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: 0.04 },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  y = 18,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: easing },
    },
  };
  return (
    <MotionTag className={cn(className)} variants={item}>
      {children}
    </MotionTag>
  );
}
