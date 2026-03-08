import { averageRating } from '@/lib/interview';

export function RatingSummary(props: {
  cultureRating: number;
  payRating: number;
  managementRating: number;
  growthRating: number;
  workLifeRating: number;
}) {
  const avg = averageRating(props);

  return <span className="meta">Avg rating: {avg}/5</span>;
}
