export function revenueScore(totalRevenue: number): number {
  if (totalRevenue >= 2500) return 40;
  if (totalRevenue >= 1000) return 30;
  if (totalRevenue >= 750) return 25;
  if (totalRevenue >= 500) return 20;
  if (totalRevenue >= 250) return 15;
  if (totalRevenue >= 100) return 10;
  return 0;
}
