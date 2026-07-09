import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ButtonColorfulProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function ButtonColorful({
  className,
  label = "Užsakyti kepinius",
  ...props
}: ButtonColorfulProps) {
  return (
    <Button
      className={cn(
        "relative h-10 px-4 overflow-hidden",
        "bg-brown-900 dark:bg-sand-100",
        "transition-all duration-200",
        "group",
        className
      )}
      {...props}
    >
      {/* Gradient background effect — Sand / Caramel / Soft Brown palette */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-sand-300 via-caramel-500 to-brown-600",
          "opacity-40 group-hover:opacity-80",
          "blur transition-opacity duration-500"
        )}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        <span className="text-white dark:text-brown-900">{label}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/90 dark:text-brown-900/90" />
      </div>
    </Button>
  );
}
