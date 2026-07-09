import { useMemo } from "react";

// Тот же путь, что уже используется в SparkleIcon внутри кнопки —
// фон и кнопка теперь говорят на одном визуальном языке.
const SPARKLE_PATH =
  "M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z";

interface Sparkle {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => {
    // 75% — мелкая тусклая "пыль", 25% — редкие яркие акценты.
    // Это и создаёт ощущение глубины неба, а не однородный шум.
    const isHero = Math.random() > 0.75;
    return {
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: isHero ? 14 + Math.random() * 8 : 3 + Math.random() * 4,
      delay: Math.random() * 6,
      duration: isHero ? 4 + Math.random() * 3 : 2 + Math.random() * 2,
    };
  });
}

export function SparkleField({ count = 44 }: { count?: number }) {
  // useMemo — чтобы звёздочки не пересчитывались (не "прыгали") при каждом ре-рендере
  const sparkles = useMemo(() => generateSparkles(count), [count]);

  return (
    <div className="sparkle-field" aria-hidden="true">
      {sparkles.map((s) => (
        <svg
          key={s.id}
          className="sparkle-particle"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
          viewBox="0 0 24 24"
          fill="var(--theme-accent)"
        >
          <path d={SPARKLE_PATH} />
        </svg>
      ))}
    </div>
  );
}
