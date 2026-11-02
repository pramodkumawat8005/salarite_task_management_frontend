import { useCallback, useEffect, useState } from "react";
import { TOAST_DURATION_MS } from "@/lib/constants";

export function useToast() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const clearToast = useCallback(() => setToast(""), []);

  return { toast, showToast: setToast, clearToast };
}
