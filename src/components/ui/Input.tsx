import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      error,
      leftAddon,
      rightAddon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div
          className={cn(
            "relative flex items-center w-full rounded-xl bg-surface-card border transition-all duration-150",
            error
              ? "border-status-error focus-within:ring-2 focus-within:ring-status-error/10"
              : "border-border-subtle focus-within:border-epis-maroon focus-within:ring-2 focus-within:ring-epis-maroon/10",
            disabled && "opacity-50 pointer-events-none bg-surface-subtle"
          )}
        >
          {leftAddon && (
            <div className="pl-3.5 pr-1 flex items-center text-text-muted pointer-events-none shrink-0">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              "w-full bg-transparent py-2.5 text-sm text-text-main placeholder:text-text-subtle outline-none",
              leftAddon ? "pl-2" : "pl-4",
              rightAddon ? "pr-2" : "pr-4",
              className
            )}
            {...props}
          />

          {rightAddon && (
            <div className="pr-3.5 pl-1 flex items-center text-text-muted shrink-0">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-status-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
