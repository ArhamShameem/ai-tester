import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "teal" | "slate" | "emerald" | "amber" | "rose";
}

export function Badge({
  className = "",
  variant = "teal",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    teal: "bg-teal-950/60 text-teal-300 border-teal-800/80",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
    emerald: "bg-emerald-950/60 text-emerald-300 border-emerald-800/80",
    amber: "bg-amber-950/60 text-amber-300 border-amber-800/80",
    rose: "bg-rose-950/60 text-rose-300 border-rose-800/80"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
