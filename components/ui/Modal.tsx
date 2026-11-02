import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, subtitle, onClose, children }: ModalProps) {
  // Keep the latest onClose in a ref so the key listener is attached only once.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
