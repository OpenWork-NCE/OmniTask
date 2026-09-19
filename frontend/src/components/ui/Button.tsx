import { motion, type HTMLMotionProps } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children" | "ref"> & {
  children?: ReactNode;
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
    <motion.button
      ref={ref}
      className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={pending ? true : disabled}
      whileHover={pending || disabled ? {} : { y: -1 }}
      whileTap={pending || disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      {...props}
    >
      {pending ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
      <span>{children}</span>
    </motion.button>
  );
});
