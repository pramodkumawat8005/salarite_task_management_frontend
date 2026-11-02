import { useCallback, useEffect, useState } from "react";
import {
  api,
  clearSession,
  getToken,
  saveSession,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // `ready` stops the login screen from flashing while we verify a saved token.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    let cancelled = false;
    api
      .me()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await api.login(payload);
    saveSession(result);
    setUser(result.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await api.register(payload);
    saveSession(result);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, ready, login, register, logout };
}
