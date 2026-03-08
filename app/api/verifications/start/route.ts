import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { fail, ok } from '@/lib/http';
import { verificationStartSchema } from '@/lib/validation';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail('Unauthorized', 401);
  }

  const payload = verificationStartSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid verification payload', 422);
  }

  const company = await prisma.company.findUnique({
    where: { id: payload.data.companyId }
  });

  if (!company) {
    return fail('Company not found', 404);
  }

  const token = generateToken();

  const verification = await prisma.employmentVerification.create({
    data: {
      userId: user.id,
      companyId: payload.data.companyId,
      workEmail: payload.data.workEmail.toLowerCase(),
      optionalDocUrl: payload.data.optionalDocUrl,
      token,
      status: 'pending'
    }
  });

  return ok({
    verificationId: verification.id,
    message: 'Verification started. Complete with token in dev mode.',
    devToken: token
  });
}
