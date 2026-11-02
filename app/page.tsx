"use client";

import { AuthScreen } from "@/components/auth/AuthScreen";
import Dashboard from "@/components/dashboard/Dashboard";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, ready, login, register, logout } = useAuth();

  if (!ready) return null; // verifying saved token
  if (!user) return <AuthScreen onLogin={login} onRegister={register} />;

  // Dashboard unmounts on logout, so all workspace state resets automatically.
  return <Dashboard user={user} onLogout={logout} />;
}
