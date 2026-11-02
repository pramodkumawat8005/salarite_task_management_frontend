import { useState, type FormEvent } from "react";
import type { LoginPayload, RegisterPayload } from "@/lib/api";
import { getErrorMessage } from "@/lib/format";
import type { Role } from "@/lib/types";

type Mode = "login" | "register";

interface AuthScreenProps {
  onLogin: (payload: LoginPayload) => Promise<void>;
  onRegister: (payload: RegisterPayload) => Promise<void>;
}

const PREVIEW_BARS = Array.from({ length: 12 }, (_, i) => i);

export function AuthScreen({ onLogin, onRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));

    try {
      if (isLogin) {
        await onLogin({ email, password });
      } else {
        await onRegister({
          display_name: String(fd.get("name")),
          email,
          password,
          role: String(fd.get("role")) as Role,
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Authentication failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <a className="brand brand-light" href="#">
          <span className="brand-mark">S</span>
          <span>
            Task Management<small>PEOPLE OPERATIONS</small>
          </span>
        </a>

        <div className="auth-hero">
          <span className="auth-overline">
            <i /> YOUR TEAM, IN SYNC
          </span>
          <h1>
            Make hiring
            <br />
            feel <em>effortless.</em>
          </h1>
          <p>
            A calmer, clearer way to manage HR tasks, organise interviews, and keep everyone moving
            forward.
          </p>

          <div className="auth-preview">
            <div className="preview-top">
              <span>WORKSPACE PULSE</span>
              <span className="preview-live">
                <i /> LIVE
              </span>
            </div>
            <div className="preview-number">
              Everything in one place<span>↗</span>
            </div>
            <div className="preview-bars">
              {PREVIEW_BARS.map((n) => (
                <i key={n} />
              ))}
            </div>
            <div className="preview-foot">
              <span>Tasks</span>
              <span>Interviews</span>
              <span>Team updates</span>
            </div>
          </div>
        </div>

        <div className="auth-bottom">
          <span>● Secure access</span>
          <span>● Role-based workspaces</span>
          <span>● Shared interview calendar</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="mobile-brand">
            <span className="brand-mark">S</span> Salarite
          </div>
          <div className="form-kicker">WELCOME TO task management</div>
          <h2>{isLogin ? "Sign in to your workspace" : "Create your account"}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? "Enter your details to continue where you left off."
              : "Get started with your own secure, role-based workspace."}
          </p>

          <div className="auth-tabs">
            <button
              className={isLogin ? "selected" : ""}
              onClick={() => switchMode("login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={!isLogin ? "selected" : ""}
              onClick={() => switchMode("register")}
              type="button"
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <label>
                Full name
                <div className="input-wrap">
                  <span>♙</span>
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="e.g. Priya Sharma"
                    autoComplete="name"
                  />
                </div>
              </label>
            )}

            <label>
              Work email
              <div className="input-wrap">
                <span>✉</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              Password
              <div className="input-wrap">
                <span>▣</span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={isLogin ? 1 : 8}
                  placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="show-pass"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {!isLogin && <small className="field-help">Use at least 8 characters.</small>}
            </label>

            {!isLogin && (
              <div className="role-field">
                <span>Choose your role</span>
                <div className="role-options">
                  <label className="role-option">
                    <input type="radio" name="role" value="employer" defaultChecked />
                    <span className="role-option-icon">♙</span>
                    <span>
                      <b>Employer</b>
                      <small>Manage tasks & team</small>
                    </span>
                  </label>
                  <label className="role-option">
                    <input type="radio" name="role" value="virtual_hr" />
                    <span className="role-option-icon">▤</span>
                    <span>
                      <b>HR</b>
                      <small>Tasks & interviews</small>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {error && <div className="auth-error">⚠ {error}</div>}

            <button className="btn btn-primary auth-submit" disabled={busy}>
              {busy
                ? isLogin
                  ? "Signing in…"
                  : "Creating account…"
                : isLogin
                  ? "Sign in securely →"
                  : "Create account →"}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <>
                New to Salarite?{" "}
                <button type="button" onClick={() => switchMode("register")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode("login")}>
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="auth-security">
            ▣ Your account is protected with token-based authentication.
          </div>
        </div>
      </section>
    </main>
  );
}
