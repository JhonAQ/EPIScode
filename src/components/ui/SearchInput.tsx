"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?: "default" | "pill";
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      variant = "default",
      value,
      onChange,
      onClear,
      placeholder = "Buscar...",
      disabled,
      ...props
    },
    ref
  ) => {
    const isPill = variant === "pill";
    const hasValue = value !== undefined && value !== "";

    return (
      <div
        className={cn(
          "relative flex items-center w-full bg-surface-card border border-border-subtle transition-all duration-150 focus-within:border-epis-maroon focus-within:ring-2 focus-within:ring-epis-maroon/10",
          isPill ? "rounded-full" : "rounded-xl",
          disabled && "opacity-50 pointer-events-none bg-surface-subtle"
        )}
      >
        {/* Accessible SVG Search Icon (Strictly no emojis) */}
        <span className="pl-3.5 pr-2 flex items-center text-text-muted pointer-events-none shrink-0">
          <svg
            className="w-4 h-4 text-text-muted"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>

        <input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(
            "w-full bg-transparent py-2 text-sm text-text-main placeholder:text-text-subtle outline-none",
            hasValue && onClear ? "pr-8" : "pr-4",
            className
          )}
          {...props}
        />

        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 p-1 rounded-full text-text-subtle hover:text-text-main hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
