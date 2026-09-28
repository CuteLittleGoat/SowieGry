// Stan zapisu w chmurze (SowieCloud.status()) po ludzku: krótko w nagłówku menu, dłużej w ustawieniach.
import { ICONS } from "../ui/icons.js";

export const CLOUD_STATUS = Object.freeze({
  haslo: { short: "Hasło", long: "Czekam na hasło.", icon: "lock" },
  laczenie: { short: "Łączę…", long: "Łączę z chmurą…", icon: "cloud" },
  online: { short: "Zapisano", long: "Postęp jest zapisany w chmurze.", icon: "cloudOk" },
  zapisywanie: { short: "Zapisuję…", long: "Zapisuję postęp w chmurze…", icon: "cloud" },
  offline: {
    short: "Offline",
    long: "Brak połączenia — postęp zostaje na telefonie i wyśle się sam, gdy wróci internet.",
    icon: "cloudOff",
  },
  blad: { short: "Błąd zapisu", long: "Zapis się nie udał — spróbuję ponownie.", icon: "cloudOff" },
});

// mode: "firestore" | "emulator" | "memory" (SowieCloud.mode()). Tryb testowy nie zapisuje do chmury.
export function cloudStatusInfo(status, mode = "firestore") {
  if (mode === "memory") {
    return { short: "Tryb testowy", long: "Tryb testowy — postęp nie trafia do chmury.", icon: "cloudOff" };
  }
  const info = CLOUD_STATUS[status] || CLOUD_STATUS.laczenie;
  if (mode === "emulator") return { ...info, short: `${info.short} (emulator)`, long: `Emulator: ${info.long}` };
  return info;
}

export function cloudStatusHtml(status, mode) {
  const info = cloudStatusInfo(status, mode);
  return `${ICONS[info.icon]}<span>${info.short}</span>`;
}
