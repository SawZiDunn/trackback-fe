import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "tab" | "link";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  active?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-secondary focus-visible:ring-primary/20",
  tab: "text-tertiary focus-visible:ring-primary/20",
  link: "p-0 text-primary hover:underline focus-visible:ring-primary/20",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", icon, active = false, className = "", children, ...props },
  ref,
) {
  const activeClasses = variant === "tab" && active ? "bg-primary text-white shadow-sm" : "";
  const baseClasses =
    variant === "link"
      ? "inline-flex cursor-pointer items-center gap-1 rounded-sm text-xs font-semibold outline-none focus-visible:ring-2"
      : "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md outline-none transition focus-visible:ring-2";

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${activeClasses} ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
});
