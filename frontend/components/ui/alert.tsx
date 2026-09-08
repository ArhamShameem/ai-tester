import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "warning" | "info";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const styles = {
    error: {
      container: "bg-rose-50 border-rose-200 text-rose-900",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
    },
    success: {
      container: "bg-[#eef5ed] border-[#cce0cb] text-[#234e32]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#2e633f] shrink-0 mt-0.5" />
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
    },
    info: {
      container: "bg-[#e8f1e6] border-[#c8dac3] text-[#234e32]",
      icon: <Info className="w-5 h-5 text-[#2e633f] shrink-0 mt-0.5" />
    }
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 border rounded-xl text-sm shadow-xs",
        current.container,
        className
      )}
      {...props}
    >
      {current.icon}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="leading-relaxed text-xs sm:text-sm">{children}</div>
      </div>
    </div>
  );
}
