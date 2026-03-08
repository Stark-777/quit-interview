import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { roleChangeSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!hasRole(user, ['moderator'])) {
    return fail('Forbidden', 403);
  }

  const payload = roleChangeSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid role payload', 422);
  }

  const updated = await prisma.user.update({
    where: { id: payload.data.userId },
    data: {
      role: payload.data.role
    }
  });

  const modCase = await prisma.moderationCase.create({
    data: {
      targetType: 'role_change',
      targetId: updated.id,
      status: 'approved',
      reason: 'policy_pass',
      moderatedById: user!.id,
      note: `Role changed to ${payload.data.role}`
    }
  });

  await prisma.moderationEvent.create({
    data: {
      moderationCaseId: modCase.id,
      actorId: user!.id,
      action: 'role_changed',
      payloadJson: JSON.stringify(payload.data)
    }
  });

  return ok(updated);
}
