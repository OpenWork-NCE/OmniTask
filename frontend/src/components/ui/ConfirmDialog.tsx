import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useRef } from "react";

import { Button } from "./Button";

type ConfirmDialogProps = Readonly<{
  open: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function ConfirmDialog({
  cancelLabel,
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  open,
  pending,
  title
}: ConfirmDialogProps) {
  const cancelButton = useRef<HTMLButtonElement>(null);
  return (
    <Dialog initialFocus={cancelButton} onClose={pending ? () => undefined : onCancel} open={open}>
      <DialogBackdrop className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition data-closed:opacity-0" />
      <div className="fixed inset-0 z-50 grid place-items-end overflow-y-auto p-3 sm:place-items-center sm:p-6">
        <DialogPanel className="w-full max-w-md rounded-3xl border border-border/50 bg-surface p-6 text-primary shadow-2xl transition duration-200 data-closed:translate-y-4 data-closed:opacity-0 sm:p-8">
          <DialogTitle className="font-display text-xl font-extrabold">{title}</DialogTitle>
          <p className="mt-3 text-muted">{description}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button ref={cancelButton} disabled={pending} onClick={onCancel} variant="secondary">
              {cancelLabel}
            </Button>
            <Button pending={pending} onClick={onConfirm} variant="danger">
              {confirmLabel}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
