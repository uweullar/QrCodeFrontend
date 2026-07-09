import { useState } from "react";
import { API_BASE_URL } from "../config";

export const useQr = () => {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchMyQrs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/qr/my`, {
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

  const updateQr = async (
    qrId: string,
    payload: { target_url?: string; title?: string },
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/qr/${qrId}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Не удалось обновить QR-код");
      const updatedQr = await res.json();
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

  const fetchQrStats = async (qrId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/qr/${qrId}/stats`, {
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
