import { NextRequest } from 'next/server';
import { ReviewStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser } from '@/lib/auth';
import { interviewCreateSchema } from '@/lib/validation';
import { containsLikelyPii, redactSignals } from '@/lib/moderation';

export async function GET() {
  const interviews = await prisma.quitInterview.findMany({
    where: { status: ReviewStatus.published },
    orderBy: { createdAt: 'desc' },
    include: {
      company: {
        select: { name: true, slug: true }
      }
    },
    take: 50
  });

  return ok(interviews);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail('Unauthorized', 401);
  }

  const payload = interviewCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid interview payload', 422);
  }

  const verification = await prisma.employmentVerification.findUnique({
    where: { id: payload.data.employmentCheckId }
  });

  if (!verification || verification.userId !== user.id) {
    return fail('Employment verification not found', 404);
  }

  if (verification.status !== 'verified') {
    return fail('Employment verification must be verified', 403);
  }

  if (verification.companyId !== payload.data.companyId) {
    return fail('Verification company does not match interview company', 422);
  }

  const piiSignals = [
    payload.data.reasonForLeaving,
    payload.data.whatWasGood,
    payload.data.whatShouldImprove,
    payload.data.advice
  ].flatMap(redactSignals);

  const hasPii = piiSignals.length > 0;

  const interview = await prisma.quitInterview.create({
    data: {
      companyId: payload.data.companyId,
      userId: user.id,
      employmentCheckId: payload.data.employmentCheckId,
      separationType: payload.data.separationType,
      employmentStartYm: payload.data.employmentStartYm,
      employmentEndYm: payload.data.employmentEndYm,
      roleTitle: payload.data.roleTitle,
      department: payload.data.department,
      cultureRating: payload.data.cultureRating,
      payRating: payload.data.payRating,
      managementRating: payload.data.managementRating,
      growthRating: payload.data.growthRating,
      workLifeRating: payload.data.workLifeRating,
      reasonForLeaving: payload.data.reasonForLeaving,
      whatWasGood: payload.data.whatWasGood,
      whatShouldImprove: payload.data.whatShouldImprove,
      advice: payload.data.advice,
      status: 'pending'
    }
  });

  await prisma.moderationCase.create({
    data: {
      targetType: 'quit_interview',
      targetId: interview.id,
      status: 'open',
      reason: hasPii ? 'pii_detected' : undefined,
      note: hasPii ? `Potential PII markers: ${piiSignals.join(', ')}` : undefined,
      events: {
        create: {
          action: 'created',
          actorId: user.id,
          payloadJson: JSON.stringify({
            hasPii,
            containsLikelyPii: containsLikelyPii(payload.data.reasonForLeaving)
          })
        }
      }
    }
  });

  return ok(interview, 201);
}
