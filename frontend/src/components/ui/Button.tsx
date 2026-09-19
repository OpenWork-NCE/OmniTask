import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  pending?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand shadow-[0_12px_32px_rgb(49_89_219/0.24)] hover:brightness-110",
  secondary: "border border-border bg-surface text-primary hover:bg-elevated",
  danger: "bg-danger text-white hover:brightness-110"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className = "", disabled, pending = false, variant = "primary", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={pending ? true : disabled}
      {...props}
    >
      {pending ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
});
