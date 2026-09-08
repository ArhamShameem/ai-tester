import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2e633f]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#2e633f] text-white shadow-sm hover:bg-[#255234]",
        primary:
          "bg-[#2e633f] text-white shadow-sm hover:bg-[#255234] font-medium",
        secondary:
          "bg-white text-[#234e32] border border-[#2e633f]/30 hover:bg-[#f3f7f1] shadow-2xs",
        outline:
          "border border-[#dce3da] bg-white text-slate-700 hover:bg-[#f6f9f4] hover:text-slate-900 shadow-2xs",
        ghost:
          "text-slate-600 hover:text-slate-900 hover:bg-[#edf3eb]",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        danger:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        link:
          "text-[#2e633f] underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs gap-1.5",
        md: "h-10 px-4 py-2.5 text-sm gap-2",
        lg: "h-11 rounded-xl px-7 text-base gap-2.5",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 shrink-0" />
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
