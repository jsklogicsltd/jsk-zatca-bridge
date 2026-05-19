import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "light" | "dark" | "gradient";
  id?: string;
}

export function SectionContainer({
  children,
  className,
  variant = "default",
  id,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full",
        variant === "default" && "bg-background",
        variant === "light" && "bg-stone-50",
        variant === "dark" && "bg-slate-900 text-white",
        variant === "gradient" && "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700",
        className
      )}
    >
      <div className="container mx-auto max-w-6xl px-6 py-16 md:py-24">
        {children}
      </div>
    </section>
  );
}
