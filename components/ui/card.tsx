import * as React from "react";
import { cn } from "@/lib/utils";

// Soft elevation, generous radius, no harsh borders (design system).
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card bg-sand-100 p-5 shadow-soft", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-title text-ink-900", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-body text-ink-600", className)} {...props} />;
}
