import * as Toast from "@radix-ui/react-toast";
import { CheckCircle2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type ToastRegionProps = Readonly<{
  message: string | null;
  onDismiss: () => void;
}>;

export function ToastRegion({ message, onDismiss }: ToastRegionProps) {
  const { t } = useTranslation();
  return (
    <Toast.Root
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border/50 bg-surface p-4 text-primary shadow-2xl data-[state=closed]:animate-[toast-out_150ms_ease-in_forwards] data-[state=open]:animate-[toast-in_200ms_ease-out]"
      duration={4_000}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      open={message !== null}
    >
      <CheckCircle2 aria-hidden className="size-5 text-emerald-500" />
      <Toast.Title className="font-bold">{message}</Toast.Title>
      <Toast.Close
        aria-label={t("accessibility.close")}
        className="grid size-9 place-items-center rounded-lg text-muted hover:bg-elevated hover:text-primary"
        onClick={onDismiss}
        type="button"
      >
        <X aria-hidden className="size-4" />
      </Toast.Close>
    </Toast.Root>
  );
}
