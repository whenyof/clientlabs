export function activityScore(daysSinceLastActivity: number | null | undefined): number {
  if (daysSinceLastActivity == null) return 0;
  if (daysSinceLastActivity < 7) return 20;
  if (daysSinceLastActivity < 30) return 10;
  if (daysSinceLastActivity < 90) return 5;
  return 0;
}
