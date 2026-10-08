import type { ReactNode } from "react";

export function AuthField({
  label,
  name,
  placeholder,
  type = "text",
  icon,
  trailingIcon,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
        {label}
      </span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary">
            {icon}
          </span>
        )}
        <input
          required
          name={name}
          type={type}
          placeholder={placeholder}
          className={`h-12 w-full rounded-md border border-neutral bg-neutral/35 px-4 text-sm text-primary outline-none transition placeholder:text-tertiary/70 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 ${
            icon ? "pl-10" : ""
          } ${trailingIcon ? "pr-10" : ""}`}
        />
        {trailingIcon && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary">
            {trailingIcon}
          </span>
        )}
      </span>
    </label>
  );
}
