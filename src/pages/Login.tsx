// pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { getSavedTheme } from "../Themes";
import { SparkleField } from "../Sparklefield";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = getSavedTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/app");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(detail || "Не удалось войти. Проверьте почту и пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-container"
      style={
        {
          "--theme-bg": theme.bg,
          "--theme-card": theme.card,
          "--theme-input-bg": theme.inputBg,
          "--theme-accent": theme.accent,
          "--theme-text": theme.text,
          "--theme-btn-bg": theme.btnBg,
          "--theme-btn-text": theme.btnText,
        } as React.CSSProperties
      }
    >
      <SparkleField count={44} />

      <div className="qr-card" style={{ maxWidth: "400px" }}>
        <h1 className="text-xl font-bold italic mb-6">Вход</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg p-3 text-sm outline-none"
            style={{ backgroundColor: "var(--theme-input-bg)" }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg p-3 text-sm outline-none"
            style={{ backgroundColor: "var(--theme-input-bg)" }}
          />

          {error && (
            <p className="text-sm text-rose-400 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sparkle-btn w-full text-center mt-2"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="text-xs opacity-60 mt-4 text-center">
          Нет аккаунта?{" "}
          <Link to="/register" style={{ color: "var(--theme-accent)" }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
