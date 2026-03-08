export function averageRating(input: {
  cultureRating: number;
  payRating: number;
  managementRating: number;
  growthRating: number;
  workLifeRating: number;
}): number {
  const sum =
    input.cultureRating +
    input.payRating +
    input.managementRating +
    input.growthRating +
    input.workLifeRating;

  return Number((sum / 5).toFixed(2));
}
