export const THEMES = [
  {
    id: "cherry",
    name: "Midnight Cherry",
    bg: "#161213",
    card: "#231A1C",
    inputBg: "#322427",
    accent: "#FFA3B1",
    text: "#FFFFFF",
    btnBg: "#FFA3B1",
    btnText: "#161213",
  },
  {
    id: "cyber",
    name: "Cyber Neon",
    bg: "#0A0F14",
    card: "#111823",
    inputBg: "#1B2536",
    accent: "#00F2FE",
    text: "#FFFFFF",
    btnBg: "#00F2FE",
    btnText: "#0A0F14",
  },
  {
    id: "amethyst",
    name: "Amethyst Night",
    bg: "#110F18",
    card: "#1A1625",
    inputBg: "#251F35",
    accent: "#D6BBFF",
    text: "#FFFFFF",
    btnBg: "#D6BBFF",
    btnText: "#110F18",
  },
  {
    id: "frost",
    name: "Nordic Frost",
    bg: "#141822",
    card: "#1E2330",
    inputBg: "#2A3143",
    accent: "#93C5FD",
    text: "#FFFFFF",
    btnBg: "#93C5FD",
    btnText: "#141822",
  },
];

export function getSavedTheme() {
  const savedThemeId = localStorage.getItem("qr-app-theme");
  if (savedThemeId) {
    const found = THEMES.find((t) => t.id === savedThemeId);
    if (found) return found;
  }
  return THEMES[0];
}
