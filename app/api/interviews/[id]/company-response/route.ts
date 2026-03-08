import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { companyResponseSchema } from '@/lib/validation';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { redactSignals } from '@/lib/moderation';
import { canCreateCompanyResponse } from '@/lib/rules';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!hasRole(user, ['company_admin'])) {
    return fail('Forbidden', 403);
  }

  const { id } = await context.params;
  const payload = companyResponseSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid response payload', 422);
  }

  const interview = await prisma.quitInterview.findUnique({ where: { id } });
  if (!interview) {
    return fail('Interview not found', 404);
  }

  const claim = await prisma.companyClaim.findFirst({
    where: {
      companyId: interview.companyId,
      userId: user!.id,
      status: 'claimed'
    }
  });

  const existing = await prisma.companyResponse.findUnique({
    where: { quitInterviewId: interview.id }
  });

  const rule = canCreateCompanyResponse({
    interviewStatus: interview.status,
    hasClaim: Boolean(claim),
    hasExistingResponse: Boolean(existing)
  });
  if (!rule.ok) {
    const status = rule.reason?.includes('already exists') ? 409 : 403;
    return fail(rule.reason ?? 'Unable to create response', status);
  }

  const response = await prisma.companyResponse.create({
    data: {
      quitInterviewId: interview.id,
      companyId: interview.companyId,
      authoredById: user!.id,
      body: payload.data.body,
      status: 'pending'
    }
  });

  const signals = redactSignals(payload.data.body);
  await prisma.moderationCase.create({
    data: {
      targetType: 'company_response',
      targetId: response.id,
      status: 'open',
      reason: signals.length ? 'pii_detected' : undefined,
      note: signals.length ? `Potential PII markers: ${signals.join(', ')}` : undefined,
      events: {
        create: {
          action: 'created',
          actorId: user!.id,
          payloadJson: JSON.stringify({ signals })
        }
      }
    }
  });

  return ok(response, 201);
}
