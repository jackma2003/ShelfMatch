export function daysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
