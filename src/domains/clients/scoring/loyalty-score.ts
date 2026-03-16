export function loyaltyScore(yearsAsCustomer: number | null | undefined): number {
  if (yearsAsCustomer == null) return 0;
  if (yearsAsCustomer > 2) return 15;
  if (yearsAsCustomer > 1) return 10;
  if (yearsAsCustomer > 0.25) return 5;
  return 0;
}
