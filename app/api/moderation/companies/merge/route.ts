import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { mergeCompaniesSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!hasRole(user, ['moderator'])) {
    return fail('Forbidden', 403);
  }

  const payload = mergeCompaniesSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid merge payload', 422);
  }

  const { sourceCompanyId, targetCompanyId } = payload.data;
  if (sourceCompanyId === targetCompanyId) {
    return fail('Source and target companies must differ', 422);
  }

  const [source, target] = await Promise.all([
    prisma.company.findUnique({ where: { id: sourceCompanyId } }),
    prisma.company.findUnique({ where: { id: targetCompanyId } })
  ]);

  if (!source || !target) {
    return fail('Company not found', 404);
  }

  await prisma.$transaction([
    prisma.quitInterview.updateMany({
      where: { companyId: sourceCompanyId },
      data: { companyId: targetCompanyId }
    }),
    prisma.employmentVerification.updateMany({
      where: { companyId: sourceCompanyId },
      data: { companyId: targetCompanyId }
    }),
    prisma.companyAlias.create({
      data: {
        companyId: targetCompanyId,
        alias: payload.data.alias ?? source.name
      }
    }),
    prisma.company.delete({ where: { id: sourceCompanyId } })
  ]);

  return ok({ mergedInto: targetCompanyId });
}
