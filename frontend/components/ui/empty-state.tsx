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
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center",
        className,
      )}
    >
      {Icon && <Icon className="text-muted-foreground size-8" />}
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-xs text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export { EmptyState };
