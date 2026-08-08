import { cn } from "@/lib/utils";

export function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:ring-3 focus-visible:outline-none active:translate-y-px",
        active
          ? "bg-gold text-foreground shadow-[0_3px_0_0_var(--gold-shadow)]"
          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
