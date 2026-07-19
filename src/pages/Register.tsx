// pages/Register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

const THEME = {
  bg: "#0A0F14",
  card: "#111823",
  inputBg: "#0D1420",
  accent: "#00F2FE",
  text: "#FFFFFF",
};

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password });
      navigate("/login");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(detail || "Не удалось зарегистрироваться.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-container"
      style={
        {
          "--theme-bg": THEME.bg,
          "--theme-card": THEME.card,
          "--theme-input-bg": THEME.inputBg,
          "--theme-accent": THEME.accent,
          "--theme-text": THEME.text,
        } as React.CSSProperties
      }
    >
      <div className="qr-card" style={{ maxWidth: "400px" }}>
        <h1 className="text-xl font-bold italic mb-6">Регистрация</h1>

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
            {loading ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-xs opacity-60 mt-4 text-center">
          Уже есть аккаунт?{" "}
          <Link to="/login" style={{ color: "var(--theme-accent)" }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
