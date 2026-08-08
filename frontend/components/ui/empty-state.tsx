import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "border-border/70 bg-paper-texture flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="bg-muted border-border animate-pop-in flex size-16 items-center justify-center rounded-full border-2 border-dashed">
          <Icon className="text-primary-accent animate-idle-bounce size-7" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-heading text-base font-medium">{title}</p>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-xs text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export { EmptyState };
