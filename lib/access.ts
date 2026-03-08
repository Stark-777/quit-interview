import type { User } from '@prisma/client';

export function canViewInterview(params: {
  user: User | null;
  interviewStatus: 'pending' | 'published' | 'rejected';
  interviewAuthorId: string;
  interviewCompanyId: string;
  claimedCompanyIds?: string[];
}): boolean {
  if (params.interviewStatus === 'published') {
    return true;
  }

  if (!params.user) {
    return false;
  }

  if (params.user.role === 'moderator') {
    return true;
  }

  if (params.user.id === params.interviewAuthorId) {
    return true;
  }

  if (
    params.user.role === 'company_admin' &&
    (params.claimedCompanyIds ?? []).includes(params.interviewCompanyId)
  ) {
    return true;
  }

  return false;
}
