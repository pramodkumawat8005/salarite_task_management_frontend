interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="toast">
      <span>✓</span>
      {message}
      <button onClick={onClose}>×</button>
    </div>
  );
}
