import { NextRequest } from 'next/server';
import { ReviewStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      interviews: {
        where: { status: ReviewStatus.published },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!company || company.status !== 'approved') {
    return fail('Company not found', 404);
  }

  return ok(company);
}
