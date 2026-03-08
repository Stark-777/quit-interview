import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser, hasRole } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!hasRole(user, ['moderator'])) {
    return fail('Forbidden', 403);
  }

  const cases = await prisma.moderationCase.findMany({
    where: { status: 'open' },
    include: {
      events: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return ok(cases);
}
