import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser } from '@/lib/auth';
import { companyClaimSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail('Unauthorized', 401);
  }

  const payload = companyClaimSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid company claim payload', 422);
  }

  const claim = await prisma.companyClaim.create({
    data: {
      companyId: payload.data.companyId,
      userId: user.id,
      evidenceUrl: payload.data.evidenceUrl,
      status: 'pending'
    }
  });

  await prisma.company.update({
    where: { id: payload.data.companyId },
    data: { claimStatus: 'pending' }
  });

  await prisma.moderationCase.create({
    data: {
      targetType: 'company_claim',
      targetId: claim.id,
      status: 'open',
      note: 'Company claim pending review',
      events: {
        create: {
          action: 'created',
          actorId: user.id,
          payloadJson: JSON.stringify({ claimId: claim.id })
        }
      }
    }
  });

  return ok(claim, 201);
}
