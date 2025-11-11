export function formatHumanDate(
  value: Date | string | null | undefined,
): string | null {
  if (!value) return null;
  const d = new Date(value);
  const day = d.getDate();
  const month = d.getMonth() + 1; // لأن الشهور بتبدأ من 0
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'اليوم';
  if (diffDays === 1) return 'منذ يوم واحد';
  if (diffDays === 2) return 'منذ يومين';
  if (diffDays <= 10) return `منذ ${diffDays} أيام`;
  if (diffDays <= 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
  return 'منذ فترة طويلة';
}
