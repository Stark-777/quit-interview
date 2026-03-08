import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { fail, ok } from '@/lib/http';
import { verificationCompleteSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail('Unauthorized', 401);
  }

  const payload = verificationCompleteSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid verification token payload', 422);
  }

  const verification = await prisma.employmentVerification.findUnique({
    where: { token: payload.data.token }
  });

  if (!verification || verification.userId !== user.id) {
    return fail('Verification not found', 404);
  }

  const updated = await prisma.employmentVerification.update({
    where: { id: verification.id },
    data: {
      status: 'verified',
      reviewedAt: new Date()
    }
  });

  return ok(updated);
}
