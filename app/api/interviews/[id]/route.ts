import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser } from '@/lib/auth';
import { canViewInterview } from '@/lib/access';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();

  const interview = await prisma.quitInterview.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          name: true,
          slug: true
        }
      },
      companyResponse: true
    }
  });

  if (!interview) {
    return fail('Interview not found', 404);
  }

  const claims =
    user?.role === 'company_admin'
      ? await prisma.companyClaim.findMany({
          where: { userId: user.id, status: 'claimed' },
          select: { companyId: true }
        })
      : [];

  const canView = canViewInterview({
    user,
    interviewStatus: interview.status,
    interviewAuthorId: interview.userId,
    interviewCompanyId: interview.companyId,
    claimedCompanyIds: claims.map((claim) => claim.companyId)
  });

  if (!canView) {
    return fail('Not found', 404);
  }

  return ok(interview);
}
