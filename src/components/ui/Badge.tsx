import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "maroon" | "gold" | "outline" | "muted" | "success" | "warning";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "maroon",
      size = "md",
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center font-medium rounded-full select-none transition-colors";

    const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
      maroon:
        "bg-epis-maroon-light text-epis-maroon border border-epis-maroon/10",
      gold:
        "bg-epis-gold-light text-amber-900 border border-epis-gold/20",
      outline:
        "bg-transparent text-text-muted border border-border-subtle",
      muted:
        "bg-surface-subtle text-text-muted border border-transparent",
      success:
        "bg-emerald-50 text-status-success border border-emerald-200/50",
      warning:
        "bg-amber-50 text-status-warning border border-amber-200/50",
    };

    const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
      sm: "px-2 py-0.5 text-[11px] gap-1",
      md: "px-2.5 py-1 text-xs gap-1.5",
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {icon && <span className="shrink-0 [&>svg]:w-3 [&>svg]:h-3">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
