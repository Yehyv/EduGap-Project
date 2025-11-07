export const RESULTS_PER_PAGE = 3;

export const formatDuration = (seconds: number, lang: "ar" | "en") => {
  if (!seconds || seconds <= 0)
    return lang === "ar" ? "بدون مدة" : "No duration";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (lang === "ar") {
    const parts = [];
    if (h) parts.push(`${h} ساعة`);
    if (m) parts.push(`${m} دقيقة`);
    if (s) parts.push(`${s} ثانية`);
    return parts.join(" و ");
  } else {
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s) parts.push(`${s}s`);
    return parts.join(" ");
  }
};
