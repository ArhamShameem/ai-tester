import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#2e633f] text-white shadow-xs hover:bg-[#234e32]",
        secondary:
          "border-[#d0dfcc] bg-[#eef4ed] text-[#234e32]",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-800",
        outline: "text-slate-700 border-[#dce3da] bg-white",
        teal: "bg-[#e8f1e6] text-[#234e32] border-[#c8dac3]",
        emerald: "bg-[#e2ece0] text-[#234e32] border-[#d0dfcc]",
        slate: "bg-slate-100 text-slate-700 border-slate-200",
        amber: "bg-amber-50 text-amber-800 border-amber-200",
        rose: "bg-rose-50 text-rose-800 border-rose-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
