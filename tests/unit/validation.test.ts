import { describe, expect, it } from 'vitest';
import { interviewCreateSchema } from '@/lib/validation';

describe('interviewCreateSchema', () => {
  const basePayload = {
    companyId: 'cmp_1',
    employmentCheckId: 'ver_1',
    separationType: 'quit',
    employmentStartYm: '2023-01',
    employmentEndYm: '2024-03',
    roleTitle: 'Engineer',
    department: 'Platform',
    cultureRating: 4,
    payRating: 4,
    managementRating: 3,
    growthRating: 4,
    workLifeRating: 5,
    reasonForLeaving: 'I left after leadership changed strategic priorities repeatedly.',
    whatWasGood: 'Great teammates and solid mentorship quality across the team.',
    whatShouldImprove: 'Compensation bands and manager training should improve substantially.',
    advice: 'Stabilize roadmap ownership and publish clear promotion expectations.',
    termsAccepted: true,
    defamationPolicyAccepted: true
  };

  it('accepts valid payload', () => {
    const parsed = interviewCreateSchema.safeParse(basePayload);
    expect(parsed.success).toBe(true);
  });

  it('rejects out-of-range ratings', () => {
    const parsed = interviewCreateSchema.safeParse({
      ...basePayload,
      cultureRating: 6
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects bad separation type', () => {
    const parsed = interviewCreateSchema.safeParse({
      ...basePayload,
      separationType: 'resigned'
    });
    expect(parsed.success).toBe(false);
  });
});
