import type { ReactNode } from "react";

function cx(...parts: (string | undefined | null | false)[]) {
  return parts.filter(Boolean).join(" ");
}

/** מעטפת מודאל: מרכז המסך. שלבי z-index: z-50 (ברירת מחדל), z-[60] למודאל מעל מודאל. */
export const modalShellClass = "fixed inset-0 flex items-center justify-center p-4";

export const modalBackdropClass = "absolute inset-0 bg-black/40";

/** פאנל תוכן: פינות עגולות אחידות, גבול וצל */
export const modalPanelClass =
  "relative flex max-h-[min(90vh,920px)] w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl";

type ModalRootProps = {
  labelledBy: string;
  onRequestClose: () => void;
  backdropAriaLabel: string;
  zClassName?: string;
  children: ReactNode;
};

export function Modal({
  labelledBy,
  onRequestClose,
  backdropAriaLabel,
  zClassName = "z-50",
  children,
}: ModalRootProps) {
  return (
    <div
      className={cx(modalShellClass, zClassName)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        type="button"
        className={modalBackdropClass}
        aria-label={backdropAriaLabel}
        onClick={onRequestClose}
      />
      {children}
    </div>
  );
}

type ModalPanelProps = {
  children: ReactNode;
  /** ברירת מחדל: max-w-lg */
  maxWidthClassName?: string;
  dir?: "rtl" | "ltr";
  className?: string;
};

export function ModalPanel({
  children,
  maxWidthClassName = "max-w-lg",
  dir,
  className,
}: ModalPanelProps) {
  return (
    <div className={cx(modalPanelClass, maxWidthClassName, className)} dir={dir}>
      {children}
    </div>
  );
}

type ModalHeaderProps = {
  titleId: string;
  title: ReactNode;
  onClose: () => void;
  closeAriaLabel: string;
  /** דחיסות אנכית (למשל מודאל עם תצוגה מקדימה) */
  dense?: boolean;
};

export function ModalHeader({
  titleId,
  title,
  onClose,
  closeAriaLabel,
  dense,
}: ModalHeaderProps) {
  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-between gap-2 border-b border-neutral-100 px-4",
        dense ? "py-2" : "py-3",
      )}
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {title}
      </h2>
      <button
        type="button"
        className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
        onClick={onClose}
        aria-label={closeAriaLabel}
      >
        ✕
      </button>
    </div>
  );
}

type ModalBodyProps = {
  children: ReactNode;
  className?: string;
};

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cx("min-h-0 flex-1 overflow-y-auto", className)}>{children}</div>
  );
}

type ModalFooterProps = {
  children: ReactNode;
  className?: string;
};

export function ModalFooter({ children, className }: ModalFooterProps) {
  return <div className={cx("shrink-0 border-t border-neutral-100 px-4 py-3", className)}>{children}</div>;
}
