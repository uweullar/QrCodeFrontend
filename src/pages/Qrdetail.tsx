import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface QrStats {
  total_clicks: number;
  browsers_breakdown: Record<string, number>;
}

export default function QrDetail() {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<QrStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Нужно войти в аккаунт, чтобы увидеть статистику.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/qr/${id}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Не удалось загрузить статистику");
        const data: QrStats = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Ошибка соединения");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [id]);

  // ВРЕМЕННО: группировка идёт по сырому User-Agent на бэкенде,
  // поэтому здесь показываем как есть — топ-5 самых частых строк.
  // Когда на бэке появятся os_family/browser_family — просто поменять
  // источник данных здесь, разметка ниже не изменится.
  const breakdownEntries = stats
    ? Object.entries(stats.browsers_breakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  const maxCount = breakdownEntries.length ? breakdownEntries[0][1] : 1;

  return (
    <div className="app-container">
      <div className="qr-card" style={{ maxWidth: "480px" }}>
        <Link
          to="/app"
          className="text-xs opacity-60 hover:opacity-100 mb-4 inline-block"
          style={{ color: "var(--theme-accent)" }}
        >
          ← Назад к кодам
        </Link>

        <h2
          className="text-lg font-bold italic mb-4"
          style={{ color: "var(--theme-accent)" }}
        >
          Статистика перехода
        </h2>

        {loading && (
          <p className="text-sm italic opacity-50 animate-pulse">
            Загрузка данных...
          </p>
        )}

        {error && <p className="text-sm text-rose-400 font-medium">{error}</p>}

        {stats && (
          <>
            <div
              className="rounded-xl p-4 mb-5"
              style={{ backgroundColor: "var(--theme-input-bg)" }}
            >
              <p className="text-xs opacity-60 mb-1">Всего сканирований</p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--theme-accent)" }}
              >
                {stats.total_clicks}
              </p>
            </div>

            <p className="text-xs opacity-60 mb-2">Разбивка по устройствам</p>
            <div className="flex flex-col gap-2">
              {breakdownEntries.length === 0 ? (
                <p className="text-sm italic opacity-40">
                  Пока нет сканирований.
                </p>
              ) : (
                breakdownEntries.map(([ua, count]) => (
                  <div key={ua} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="truncate max-w-[80%] opacity-80">
                        {ua}
                      </span>
                      <span style={{ color: "var(--theme-accent)" }}>
                        {count}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          backgroundColor: "var(--theme-accent)",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
