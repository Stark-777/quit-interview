import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser } from '@/lib/auth';
import { reportSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const payload = reportSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid report payload', 422);
  }

  if (payload.data.targetType === 'quit_interview') {
    const target = await prisma.quitInterview.findUnique({
      where: { id: payload.data.targetId }
    });
    if (!target) {
      return fail('Interview not found', 404);
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user?.id,
        targetType: 'quit_interview',
        quitInterviewId: target.id,
        reason: payload.data.reason
      }
    });

    return ok(report, 201);
  }

  const response = await prisma.companyResponse.findUnique({
    where: { id: payload.data.targetId }
  });
  if (!response) {
    return fail('Response not found', 404);
  }

  const report = await prisma.report.create({
    data: {
      reporterId: user?.id,
      targetType: 'company_response',
      companyResponseId: response.id,
      reason: payload.data.reason
    }
  });

  return ok(report, 201);
}
