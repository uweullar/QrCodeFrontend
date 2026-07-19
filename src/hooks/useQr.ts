import { useState } from "react";
import { api } from "../api";

export const useQr = () => {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyQrs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/qr/my");
      setQrCodes(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Не удалось загрузить QR-коды");
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
      const res = await api.patch(`/qr/${qrId}`, payload);
      setQrCodes((prev) => prev.map((qr) => (qr.id === qrId ? res.data : qr)));
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка обновления");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchQrStats = async (qrId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/qr/${qrId}/stats`);
      setCurrentStats(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка загрузки статистики");
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
