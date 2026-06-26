"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// One primary action per screen; tap targets ≥ 56px (accessibility floor).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-card font-sans font-bold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 select-none",
  {
    variants: {
      variant: {
        primary: "bg-ink-900 text-sand-50 shadow-soft hover:bg-ink-900/90",
        flare: "bg-flare-600 text-white shadow-lift hover:bg-flare-700 active:bg-flare-700",
        relief: "bg-relief-600 text-white shadow-soft hover:bg-relief-600/90",
        outline: "border-2 border-ink-900/15 bg-sand-100 text-ink-900 hover:border-ink-900/30",
        ghost: "bg-transparent text-ink-900 hover:bg-sand-100",
        danger: "border-2 border-flare-600/30 bg-transparent text-flare-700 hover:bg-flare-600/10",
      },
      size: {
        // every size meets the 56px tap-target floor
        md: "min-h-touch px-5 text-body",
        lg: "min-h-[64px] px-7 text-title",
        block: "min-h-touch w-full px-5 text-body",
        blockLg: "min-h-[68px] w-full px-6 text-title",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
