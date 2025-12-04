export const RESULTS_PER_PAGE = 10;
export const LESSON_TYPES = {
  QUIZ: 1,
  LESSON: 0,
};

export const formatDuration = (seconds: number, lang: "ar" | "en") => {
  if (!seconds || seconds <= 0)
    return lang === "ar" ? "بدون مدة" : "No duration";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const formatNum = (n: number) =>
    lang === "ar" ? n.toLocaleString("ar-EG") : n.toString();

  if (lang === "ar") {
    const parts = [];
    if (h) parts.push(`${formatNum(h)} ساعة`);
    if (m) parts.push(`${formatNum(m)} دقيقة`);
    if (s) parts.push(`${formatNum(s)} ثانية`);
    return parts.join(" و ");
  } else {
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s) parts.push(`${s}s`);
    return parts.join(" ");
  }
};
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return ""; // invalid date
    return date.toISOString().split("T")[0]; // returns YYYY-MM-DD
  } catch {
    return "";
  }
};
