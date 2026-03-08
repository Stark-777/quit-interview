import { describe, expect, it } from 'vitest';
import type { User } from '@prisma/client';
import { canViewInterview } from '@/lib/access';

function user(partial: Partial<User>): User {
  return {
    id: 'u1',
    email: 'x@example.com',
    role: 'employee',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial
  };
}

describe('canViewInterview', () => {
  it('allows public access for published interviews', () => {
    expect(
      canViewInterview({
        user: null,
        interviewStatus: 'published',
        interviewAuthorId: 'a1',
        interviewCompanyId: 'c1'
      })
    ).toBe(true);
  });

  it('blocks anonymous users from pending interviews', () => {
    expect(
      canViewInterview({
        user: null,
        interviewStatus: 'pending',
        interviewAuthorId: 'a1',
        interviewCompanyId: 'c1'
      })
    ).toBe(false);
  });

  it('allows moderators for pending interviews', () => {
    expect(
      canViewInterview({
        user: user({ role: 'moderator' }),
        interviewStatus: 'pending',
        interviewAuthorId: 'a1',
        interviewCompanyId: 'c1'
      })
    ).toBe(true);
  });
});
