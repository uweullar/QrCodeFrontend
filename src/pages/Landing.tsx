import { Link } from "react-router-dom";
import { SparkleField } from "../Sparklefield";

// Тема захардкожена под первую (Cyber Neon) — на лендинге ещё нет
// авторизованного контекста темы, это нормально для первого экрана.
const LANDING_THEME = {
  bg: "#0A0F14",
  card: "#111823",
  accent: "#00F2FE",
  text: "#FFFFFF",
};

export default function Landing() {
  return (
    <div
      className="app-container"
      style={
        {
          "--theme-bg": LANDING_THEME.bg,
          "--theme-card": LANDING_THEME.card,
          "--theme-accent": LANDING_THEME.accent,
          "--theme-text": LANDING_THEME.text,
        } as React.CSSProperties
      }
    >
      <SparkleField count={44} />

      <div className="qr-card text-center" style={{ maxWidth: "520px" }}>
        <h1 className="text-2xl font-bold italic mb-3">
          QR-коды, которые можно менять после печати
        </h1>
        <p className="text-sm opacity-70 mb-6 leading-relaxed">
          Создайте один код — печатайте один раз. Меняйте, куда он ведёт, прямо
          из личного кабинета, и смотрите, кто и с какого устройства его
          сканирует.
        </p>

        <div className="flex flex-col gap-3 text-left mb-6">
          <Feature title="Динамическая ссылка">
            Обновляете адрес назначения в любой момент — сам код перепечатывать
            не нужно.
          </Feature>
          <Feature title="Аналитика в реальном времени">
            Видите число сканирований и с каких устройств приходят люди.
          </Feature>
          <Feature title="Свой стиль">
            Цвет кода, фон или полностью прозрачная подложка — под любой дизайн.
          </Feature>
        </div>

        <Link to="/app" className="sparkle-btn inline-block w-full text-center">
          Создать первый QR-код
        </Link>
      </div>
    </div>
  );
}

function Feature({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
    >
      <p
        className="text-sm font-bold mb-1"
        style={{ color: "var(--theme-accent)" }}
      >
        {title}
      </p>
      <p className="text-xs opacity-70">{children}</p>
    </div>
  );
}
