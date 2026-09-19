import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string | undefined;
  error?: string | undefined;
  trailing?: ReactNode;
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { className = "", description, error, id: providedId, label, trailing, ...props },
  ref
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label className="font-semibold text-primary" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={`min-h-12 w-full rounded-xl border bg-surface px-4 text-primary shadow-sm transition placeholder:text-muted/70 hover:border-brand focus:border-brand ${error ? "border-danger" : "border-border"} ${trailing ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>
        ) : null}
      </div>
      {description ? (
        <p className="text-sm text-muted" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-semibold text-danger" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
});
