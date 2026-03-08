import { describe, expect, it } from 'vitest';
import { canCreateCompanyResponse } from '@/lib/rules';

describe('company response rules', () => {
  it('permits only when interview is published, claim exists, and no prior response', () => {
    expect(
      canCreateCompanyResponse({
        interviewStatus: 'published',
        hasClaim: true,
        hasExistingResponse: false
      }).ok
    ).toBe(true);
  });

  it('rejects when existing response already exists', () => {
    const result = canCreateCompanyResponse({
      interviewStatus: 'published',
      hasClaim: true,
      hasExistingResponse: true
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('already exists');
  });
});
