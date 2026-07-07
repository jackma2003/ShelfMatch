"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ToastProvider = ToastPrimitive.Provider;
const useToastManager = ToastPrimitive.useToastManager;

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className={cn(
          "fixed inset-x-0 bottom-20 z-50 mx-auto flex w-full max-w-sm flex-col gap-2 px-4 outline-none md:bottom-6",
          className,
        )}
        {...props}
      />
    </ToastPrimitive.Portal>
  );
}

function ToastRoot({ className, toast, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      toast={toast}
      className={cn(
        "bg-popover text-popover-foreground ring-foreground/10 shadow-foreground/5 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-2 data-closed:animate-out data-closed:fade-out-0 relative w-full rounded-xl p-4 pr-9 text-sm shadow-lg ring-1 transition-all data-ending-style:translate-y-1 data-ending-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("font-heading text-sm leading-snug font-medium", className)}
      {...props}
    />
  );
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-muted-foreground mt-0.5 text-sm", className)}
      {...props}
    />
  );
}

function ToastAction({ className, ...props }: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={
        <Button
          variant="link"
          size="sm"
          className={cn("text-primary mt-1 h-auto p-0 font-semibold", className)}
        />
      }
      {...props}
    />
  );
}

function ToastClose({ className, ...props }: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      render={
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn("absolute top-2 right-2", className)}
        />
      }
      {...props}
    >
      <XIcon />
      <span className="sr-only">Dismiss</span>
    </ToastPrimitive.Close>
  );
}

function Toaster() {
  const { toasts } = useToastManager();

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <ToastRoot key={toast.id} toast={toast}>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          <ToastAction />
          <ToastClose />
        </ToastRoot>
      ))}
    </ToastViewport>
  );
}

export {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  Toaster,
  useToastManager,
};
