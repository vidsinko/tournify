"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm animate-fade-in" />
      <div
        className={cn(
          "relative w-full bg-surface-800 border border-surface-700 rounded-2xl shadow-xl animate-slide-up",
          sizes[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-surface-700">
            <div>
              {title && (
                <h2 id="modal-title" className="text-base font-semibold text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-surface-400 mt-0.5">{description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-4 shrink-0 -mt-1 -mr-1"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-surface-700 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
