"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { cn } from "@/lib/cn";
import { FieldShell } from "@/components/ui/FieldShell";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M5.5 7.5 10 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface CategorySelectProps {
  id: string;
  label: string;
  value: string;
  /** Empty = unresolved (no valid options at all); one entry = locked/auto; 2+ = user must choose. */
  options: string[];
  onChange: (category: string) => void;
  onBlur?: () => void;
  placeholder: string;
  locked: boolean;
  disabled: boolean;
  helperText?: string;
  error?: string;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
}

export function CategorySelect({
  id,
  label,
  value,
  options,
  onChange,
  onBlur,
  placeholder,
  locked,
  disabled,
  helperText,
  error,
  name,
  ref,
}: CategorySelectProps) {
  const listboxId = `${id}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function toggleOpen() {
    if (disabled || locked) return;
    setIsOpen((open) => {
      const next = !open;
      if (next) setActiveIndex(Math.max(options.indexOf(value), 0));
      return next;
    });
  }

  function selectOption(category: string) {
    onChange(category);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || locked) return;
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex(Math.max(options.indexOf(value), 0));
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) selectOption(option);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  }

  const isInteractive = !disabled && !locked && options.length > 0;

  return (
    <FieldShell label={label} htmlFor={id} helperText={helperText} error={error}>
      <div ref={containerRef} className="relative">
        <button
          ref={ref}
          type="button"
          id={id}
          name={name}
          disabled={disabled || locked}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setIsOpen(false);
            onBlur?.();
          }}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-surface px-3.5 text-left text-sm transition-colors",
            error ? "border-red-400" : "border-border-default",
            isOpen && "border-brand-500 ring-2 ring-brand-100",
            (disabled || locked) && "cursor-default bg-surface-muted",
            isInteractive && "cursor-pointer focus:outline-none",
          )}
        >
          <span className={cn("truncate", value ? "font-medium text-ink-900" : "text-ink-400")}>
            {value || placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {value && <CheckIcon className="h-4 w-4 text-success-500" />}
            {isInteractive && (
              <ChevronIcon
                className={cn("h-4 w-4 text-ink-400 transition-transform duration-150", isOpen && "rotate-180")}
              />
            )}
          </span>
        </button>

        {isInteractive && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            aria-hidden={!isOpen}
            className={cn(
              "absolute z-20 mt-2 w-full origin-top overflow-hidden rounded-xl border border-border-default bg-surface p-1.5 shadow-lg",
              "transition-all duration-150 ease-out motion-reduce:transition-none",
              isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0",
            )}
          >
            {options.map((option, index) => (
              <li
                key={option}
                role="option"
                aria-selected={option === value}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  index === activeIndex ? "bg-brand-50" : "hover:bg-surface-muted",
                  option === value ? "font-medium text-ink-900" : "text-ink-800",
                )}
              >
                {option}
                {option === value && <CheckIcon className="h-4 w-4 shrink-0 text-success-500" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </FieldShell>
  );
}
