export function frequencyScore(purchaseCount: number | null | undefined): number {
  const count = purchaseCount ?? 0;
  if (count >= 10) return 20;
  if (count >= 5) return 15;
  if (count >= 2) return 10;
  if (count === 1) return 5;
  return 0;
}
