import { useState } from "react";

export const useQr = () => {
  const BASE_URL = "http://127.0.0.1:8000"; // Адрес твоего FastAPI

  // Состояния в стиле React
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Заголовки с токеном
  const getHeaders = () => {
    // 1. Достаем токен, который сохранился при авторизации
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // 2. Если токен есть, обязательно добавляем его в формате Bearer
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  // 1. ПОЛУЧЕНИЕ ВСЕХ QR-КОДОВ (GET)
  const fetchMyQrs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/qr/my", {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Не удалось загрузить QR-коды");
      const data = await res.json();
      setQrCodes(data);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. ОБНОВЛЕНИЕ ССЫЛКИ (PATCH)
  const updateQr = async (
    qrId: string,
    payload: { target_url?: string; title?: string },
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/qr/${qrId}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Не удалось обновить QR-код");
      const updatedQr = await res.json();

      // Обновляем состояние в массиве
      setQrCodes((prev) => prev.map((qr) => (qr.id === qrId ? updatedQr : qr)));
      return updatedQr;
    } catch (err: any) {
      setError(err.message || "Ошибка обновления");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. СТАТИСТИКА КЛИКОВ (GET)
  const fetchQrStats = async (qrId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/qr/${qrId}/stats`, {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Не удалось загрузить статистику");
      const stats = await res.json();
      setCurrentStats(stats);
      return stats;
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки статистики");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    qrCodes,
    currentStats,
    loading,
    error,
    fetchMyQrs,
    updateQr,
    fetchQrStats,
  };
};
