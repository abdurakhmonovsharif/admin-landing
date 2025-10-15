import type { LocalTime } from "@/lib/api/models/LocalTime";

export function localTimeToString(value?: LocalTime | string | null) {
  if (!value) return "";
  if (typeof value === "string") {
    const [hourRaw = "", minuteRaw = ""] = value.split(":");
    const hourNormalized = hourRaw.trim().padStart(2, "0").slice(-2);
    if (!hourNormalized.trim()) {
      return "";
    }
    const minuteNormalized = (minuteRaw.trim() || "0").padStart(2, "0").slice(-2);
    return `${hourNormalized}:${minuteNormalized}`;
  }
  const { hour = 0, minute = 0 } = value;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function stringToLocalTime(value?: string | null): LocalTime | undefined {
  if (!value) return undefined;
  const [hourString, minuteString] = value.split(":");
  const hour = Number(hourString ?? 0);
  const minute = Number(minuteString ?? 0);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return undefined;
  }
  return {
    hour,
    minute,
    second: 0,
    nano: 0,
  };
}
