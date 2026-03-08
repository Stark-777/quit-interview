import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { moderationDecisionSchema } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!hasRole(user, ['moderator'])) {
    return fail('Forbidden', 403);
  }

  const payload = moderationDecisionSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid moderation decision payload', 422);
  }

  const { id } = await context.params;

  const modCase = await prisma.moderationCase.findUnique({ where: { id } });
  if (!modCase) {
    return fail('Moderation case not found', 404);
  }

  const status = payload.data.status;
  const reason = payload.data.reason;

  await prisma.moderationCase.update({
    where: { id: modCase.id },
    data: {
      status,
      reason,
      note: payload.data.note,
      moderatedById: user!.id
    }
  });

  if (modCase.targetType === 'company') {
    await prisma.company.update({
      where: { id: modCase.targetId },
      data: { status: status === 'approved' ? 'approved' : 'rejected' }
    });
  }

  if (modCase.targetType === 'quit_interview') {
    await prisma.quitInterview.update({
      where: { id: modCase.targetId },
      data: { status: status === 'approved' ? 'published' : 'rejected' }
    });
  }

  if (modCase.targetType === 'company_response') {
    await prisma.companyResponse.update({
      where: { id: modCase.targetId },
      data: { status: status === 'approved' ? 'published' : 'rejected' }
    });
  }

  if (modCase.targetType === 'company_claim') {
    await prisma.companyClaim.update({
      where: { id: modCase.targetId },
      data: { status: status === 'approved' ? 'claimed' : 'rejected' }
    });
  }

  await prisma.moderationEvent.create({
    data: {
      moderationCaseId: modCase.id,
      actorId: user!.id,
      action: 'decision',
      payloadJson: JSON.stringify(payload.data)
    }
  });

  return ok({ caseId: modCase.id, status });
}
