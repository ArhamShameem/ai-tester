import React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "warning" | "info";
  title?: string;
}

export function Alert({
  className = "",
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const styles = {
    error: {
      container: "bg-rose-950/40 border-rose-800/60 text-rose-200",
      icon: (
        <svg
          width={20}
          height={20}
          className="w-5 h-5 text-rose-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    success: {
      container: "bg-emerald-950/40 border-emerald-800/60 text-emerald-200",
      icon: (
        <svg
          width={20}
          height={20}
          className="w-5 h-5 text-emerald-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    warning: {
      container: "bg-amber-950/40 border-amber-800/60 text-amber-200",
      icon: (
        <svg
          width={20}
          height={20}
          className="w-5 h-5 text-amber-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )
    },
    info: {
      container: "bg-teal-950/40 border-teal-800/60 text-teal-200",
      icon: (
        <svg
          width={20}
          height={20}
          className="w-5 h-5 text-teal-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    }
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 border rounded-lg text-sm ${current.container} ${className}`}
      {...props}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
