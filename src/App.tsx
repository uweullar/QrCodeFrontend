import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { useQr } from "./hooks/useQr";
import { SparkleField } from "./Sparklefield";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "./config";
import { THEMES } from "./Themes";

export default function App() {
  const { qrCodes, loading, error, fetchMyQrs } = useQr();

  const [view, setView] = useState<"create" | "history" | "auth">("create");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Состояние для отслеживания редактируемого кода из истории
  const [editingQr, setEditingQr] = useState<any | null>(null);

  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedThemeId = localStorage.getItem("qr-app-theme");
    if (savedThemeId) {
      const foundTheme = THEMES.find((t) => t.id === savedThemeId);
      if (foundTheme) return foundTheme;
    }
    return THEMES[0];
  });

  const [fillColor, setFillColor] = useState("#2C2C2C");
  const [backColor, setBackColor] = useState("#FFFFFF");
  const [isTransparent, setIsTransparent] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("qr-app-theme", currentTheme.id);
  }, [currentTheme]);

  // Чистая функция генерации самой картинки из переданной строки
  const generateQrImage = async (content: string) => {
    try {
      const url = await QRCode.toDataURL(content, {
        color: {
          dark: fillColor,
          light: isTransparent ? "#00000000" : backColor,
        },
        margin: 2,
        width: 300,
      });
      setQrDataUrl(url);
    } catch (err) {
      alert("Ошибка визуализации QR: " + err);
    }
  };

  // Главный метод отправки/обновления данных на бэкенде
  const handleQrSubmit = async () => {
    if (!text.trim()) return;

    if (!isAuthenticated) {
      await generateQrImage(text);
      return;
    }

    const token = localStorage.getItem("token");

    console.log("Токен перед отправкой:", token);

    if (!token || token === "undefined" || token === "null") {
      alert(
        "Ошибка: Токен авторизации поврежден или отсутствует. Перезайдите в аккаунт.",
      );
      handleLogout();
      return;
    }

    try {
      if (editingQr) {
        // --- РЕДАКТИРОВАНИЕ СУЩЕСТВУЮЩЕГО КОДА (PUT) ---
        const res = await fetch(`${API_BASE_URL}/qr/${editingQr.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ target_url: text, title: editingQr.title }),
        });

        if (!res.ok) throw new Error("Не удалось обновить ссылку на бэкенде");

        alert("Ссылка успешно изменена!");
        setEditingQr(null);
        setText("");
        setQrDataUrl("");
        fetchMyQrs();
      } else {
        // --- СОЗДАНИЕ НОВОГО ДИНАМИЧЕСКОГО КОДА (POST) ---
        // ИСПРАВЛЕНО: Заменены кавычки на бэктики `
        const res = await fetch(`${API_BASE_URL}/qr/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ target_url: text, title: "Новый QR" }),
        });

        if (!res.ok) throw new Error("Не удалось сохранить код на бэкенде");
        const data = await res.json();

        // Зашиваем в QR именно короткую ссылку-редирект с бэкенда!
        const shortRedirectUrl = `${API_BASE_URL}/r/${data.short_id}`;
        await generateQrImage(shortRedirectUrl);
        fetchMyQrs();
      }
    } catch (err: any) {
      alert("Ошибка синхронизации: " + err.message);
    }
  };

  // Функция скачивания готового QR-кода в формате PNG
  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const downloadLink = document.createElement("a");
    downloadLink.href = qrDataUrl;
    downloadLink.download = `qr-${editingQr ? editingQr.short_id : "code"}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyToClipboard = async () => {
    if (!qrDataUrl) return;
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      alert("QR-код скопирован в буфер обмена!");
    } catch (err) {
      alert("Не удалось скопировать: " + err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!username.trim() || !password.trim()) {
      setAuthError("Заполните все поля!");
      return;
    }

    try {
      if (authMode === "login") {
        // ИСПРАВЛЕНО: Заменены кавычки на бэктики `
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username, password }),
        });
        if (!res.ok) throw new Error("Неверный email или пароль");
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        setIsAuthenticated(true);
        setView("history");
        fetchMyQrs();
      } else {
        // ИСПРАВЛЕНО: Заменены кавычки на бэктики `
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username, password }),
        });
        if (!res.ok) throw new Error("Ошибка при регистрации");
        alert("Успешно! Теперь войдите.");
        setAuthMode("login");
      }
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Ошибка соединения");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setEditingQr(null);
    setView("create");
    setUsername("");
    setPassword("");
    setQrDataUrl("");
    setText("");
  };

  return (
    <div
      className="app-container"
      style={
        {
          "--theme-bg": currentTheme.bg,
          "--theme-card": currentTheme.card,
          "--theme-input-bg": currentTheme.inputBg,
          "--theme-accent": currentTheme.accent,
          "--theme-text": currentTheme.text,
          "--theme-btn-bg": currentTheme.btnBg,
          "--theme-btn-text": currentTheme.btnText,
        } as React.CSSProperties
      }
    >
      <SparkleField count={50} />

      <div className="w-full max-w-[430px] flex justify-between items-end px-1 mb-2.5 min-h-[36px]">
        {!isAuthenticated ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setView(
                  view === "auth" && authMode === "login" ? "create" : "auth",
                );
                setAuthMode("login");
              }}
              className="px-5 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-white/[0.03]"
              style={{
                backgroundColor:
                  view === "auth" && authMode === "login"
                    ? "var(--theme-card)"
                    : "rgba(255,255,255,0.03)",
                color:
                  view === "auth" && authMode === "login"
                    ? "var(--theme-accent)"
                    : "rgba(255,255,255,0.4)",
              }}
            >
              Вход
            </button>
            <button
              onClick={() => {
                setView(
                  view === "auth" && authMode === "register"
                    ? "create"
                    : "auth",
                );
                setAuthMode("register");
              }}
              className="px-5 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-white/[0.03]"
              style={{
                backgroundColor:
                  view === "auth" && authMode === "register"
                    ? "var(--theme-card)"
                    : "rgba(255,255,255,0.03)",
                color:
                  view === "auth" && authMode === "register"
                    ? "var(--theme-accent)"
                    : "rgba(255,255,255,0.4)",
              }}
            >
              Регистрация
            </button>
          </div>
        ) : (
          <span className="text-[11px] opacity-25 italic px-1 self-center">
            Авторизован
          </span>
        )}
      </div>

      <div className="qr-card">
        <div className="flex justify-between items-center mb-5 w-full px-0.5">
          <button
            onClick={() => {
              if (view !== "create") {
                setView("create");
              } else if (isAuthenticated) {
                setView("history");
                fetchMyQrs();
              } else {
                setAuthMode("login");
                setView("auth");
              }
            }}
            className="text-xl cursor-pointer opacity-70 hover:opacity-100 transition-opacity select-none"
            style={{ color: "var(--theme-text)" }}
          >
            {view === "create" ? "☰" : "✕"}
          </button>

          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setCurrentTheme(t)}
                title={t.name}
                className={`w-6 h-6 rounded-full cursor-pointer transition-all duration-300 ${
                  currentTheme.id === t.id
                    ? "scale-125 ring-2 ring-white ring-offset-2"
                    : "opacity-55 hover:opacity-100"
                }`}
                style={
                  {
                    backgroundColor: t.accent,
                    "--tw-ring-offset-color": currentTheme.card,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {editingQr && (
                <div
                  className="text-[11px] mb-2 px-1 text-left flex justify-between items-center opacity-80"
                  style={{ color: "var(--theme-accent)" }}
                >
                  <span>✏️ Режим изменения кода /r/{editingQr.short_id}</span>
                  <button
                    onClick={() => {
                      setEditingQr(null);
                      setText("");
                      setQrDataUrl("");
                    }}
                    className="underline text-rose-400 cursor-pointer hover:text-rose-300"
                  >
                    Отмена
                  </button>
                </div>
              )}

              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="qr-input"
                placeholder="Введите text или ссылку..."
              />

              <div className="flex flex-wrap gap-3 justify-center items-center my-4">
                <label className="color-picker-label">
                  🎨 QR цвет
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-0 h-0 opacity-0"
                  />
                </label>

                <div className="split-widget">
                  <label className="split-widget-label">
                    🖼️ Фон
                    <input
                      type="color"
                      value={backColor}
                      onChange={(e) => {
                        setBackColor(e.target.value);
                        setIsTransparent(false);
                      }}
                      className="w-0 h-0 opacity-0"
                    />
                  </label>
                  <div className="split-widget-divider" />
                  <button
                    onClick={() => setIsTransparent(!isTransparent)}
                    className={`transparent-toggle-btn ${isTransparent ? "active-status" : "inactive-status"}`}
                  >
                    {isTransparent ? "Прозрачный" : "Сплошной"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center min-h-[190px] my-4 w-full">
                {qrDataUrl && (
                  <div className="animate-qr-reveal flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl mt-4">
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="w-48 h-48 select-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-5 w-full">
                <button
                  onClick={handleQrSubmit}
                  className="sparkle-btn group relative flex w-full items-center justify-center py-3 text-sm font-medium tracking-wide overflow-visible text-white transition-all duration-300 active:scale-[0.98]"
                >
                  <span className="relative z-10">
                    {editingQr ? "Обновить ссылку" : "Сгенерировать QR"}
                  </span>

                  <div className="absolute inset-0 pointer-events-none opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out">
                    <svg
                      className="absolute -top-3 left-6 w-4 h-4 text-[#fffdef] animate-pulse"
                      style={{ filter: "drop-shadow(0 0 8px #fffdef)" }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
                    </svg>

                    <svg
                      className="absolute -top-1.5 left-1/3 w-2.5 h-2.5 text-[#fffdef]"
                      style={{ filter: "drop-shadow(0 0 6px #fffdef)" }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
                    </svg>

                    <svg
                      className="absolute -top-4 right-4 w-4.5 h-4.5 text-[#fffdef]"
                      style={{ filter: "drop-shadow(0 0 10px #fffdef)" }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
                    </svg>

                    <svg
                      className="absolute -bottom-2 left-12 w-3 h-3 text-[#fffdef]"
                      style={{ filter: "drop-shadow(0 0 6px #fffdef)" }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
                    </svg>

                    <svg
                      className="absolute -bottom-3 right-8 w-4 h-4 text-[#fffdef]"
                      style={{ filter: "drop-shadow(0 0 8px #fffdef)" }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
                    </svg>
                  </div>
                </button>

                {qrDataUrl && (
                  <div className="flex gap-2 w-full mt-1 animate-qr-reveal">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 rounded-xl text-xs py-2.5 flex items-center justify-center gap-2 border border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.06] text-white transition-all"
                    >
                      <svg
                        className="w-4 h-4 opacity-75"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      <span>Копировать</span>
                    </button>

                    <button
                      onClick={downloadQrCode}
                      title="Скачать PNG"
                      className="px-3.5 py-2.5 rounded-xl flex items-center justify-center border border-white/[0.05] bg-white/[0.04] hover:bg-white/[0.08] hover:scale-105 active:scale-95 transition-all"
                      style={{ color: "var(--theme-accent)" }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === "auth" && (
            <motion.form
              key="auth"
              onSubmit={handleAuth}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full flex flex-col text-left mt-1"
            >
              <h2
                className="text-base font-bold mb-4 italic"
                style={{ color: "var(--theme-accent)" }}
              >
                {authMode === "login"
                  ? "Вход в аккаунт"
                  : "Регистрация в системе"}
              </h2>
              <input
                type="text"
                placeholder="user@gmail.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="qr-input"
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="qr-input"
              />
              {authError && (
                <p className="text-xs text-rose-400 font-bold mb-3">
                  ⚠️ {authError}
                </p>
              )}
              <button
                type="submit"
                className="sparkle-btn w-full text-center py-3 mt-2"
              >
                {authMode === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            </motion.form>
          )}

          {view === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full flex flex-col text-left mt-1"
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-base font-bold italic"
                  style={{ color: "var(--theme-accent)" }}
                >
                  История кодов
                </h2>
                <button
                  onClick={handleLogout}
                  className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-medium"
                >
                  Выйти
                </button>
              </div>

              {loading && (
                <p className="text-sm italic opacity-50 animate-pulse mt-4">
                  Загрузка данных...
                </p>
              )}

              {error && (
                <p className="text-sm text-rose-400 font-medium mt-4">
                  ⚠️ Ошибка: {error}
                </p>
              )}

              {!loading && !error && (
                <div className="w-full overflow-y-auto pr-1 flex flex-col gap-3 max-h-[320px] custom-scrollbar">
                  {qrCodes.length === 0 ? (
                    <p className="text-sm italic opacity-40 mt-4">
                      Здесь пока пусто.
                    </p>
                  ) : (
                    qrCodes.map((qr: any) => {
                      let displayTitle = qr.title;
                      if (!displayTitle || displayTitle === "string") {
                        try {
                          if (qr.target_url && qr.target_url !== "string") {
                            const urlObj = new URL(qr.target_url);
                            displayTitle = urlObj.hostname.replace("www.", "");
                          } else {
                            displayTitle = "Текстовый QR";
                          }
                        } catch {
                          displayTitle =
                            qr.target_url !== "string"
                              ? qr.target_url
                              : "Новый код";
                        }
                      }

                      return (
                        <div
                          key={qr.id}
                          className="p-3.5 rounded-xl border border-white/[0.03] flex justify-between items-center gap-3 transition-all duration-300 hover:border-white/[0.08]"
                          style={{ backgroundColor: "var(--theme-input-bg)" }}
                        >
                          <div className="flex flex-col gap-1.5 truncate max-w-[70%]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm truncate text-white">
                                {displayTitle}
                              </span>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold opacity-60"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.05)",
                                  color: "var(--theme-accent)",
                                }}
                              >
                                /r/{qr.short_id}
                              </span>

                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 bg-white/[0.04] text-neutral-400">
                                👁️{" "}
                                {qr.scan_count !== undefined
                                  ? qr.scan_count
                                  : qr.clicks || 0}
                              </span>
                            </div>
                            <p className="text-xs opacity-50 truncate font-mono">
                              {qr.target_url && qr.target_url !== "string"
                                ? qr.target_url
                                : "содержимое не задано"}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              const urlText =
                                qr.target_url && qr.target_url !== "string"
                                  ? qr.target_url
                                  : "";
                              setEditingQr(qr);
                              setText(urlText);
                              generateQrImage(
                                `${API_BASE_URL}/r/${qr.short_id}`,
                              );
                              setView("create");
                            }}
                            title="Редактировать код"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.05] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.02)",
                              color: "var(--theme-accent)",
                            }}
                          >
                            <svg
                              className="w-4 h-4 transform rotate-180"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="2.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                              />
                            </svg>
                          </button>
                          <Link
                            to={`/qr/${qr.id}`}
                            className="text-[10px] underline opacity-60 hover:opacity-100"
                          >
                            Статистика →
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
