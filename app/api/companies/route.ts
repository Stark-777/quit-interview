import { NextRequest } from 'next/server';
import { CompanyStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { getCurrentUser } from '@/lib/auth';
import { companyCreateSchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';

export async function GET() {
  const companies = await prisma.company.findMany({
    where: { status: CompanyStatus.approved },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      website: true
    }
  });

  return ok(companies);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return fail('Unauthorized', 401);
  }

  const payload = companyCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return fail('Invalid company payload', 422);
  }

  const baseSlug = slugify(payload.data.name);
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.company.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const company = await prisma.company.create({
    data: {
      name: payload.data.name,
      website: payload.data.website,
      slug,
      status: CompanyStatus.pending,
      createdById: user.id
    }
  });

  await prisma.moderationCase.create({
    data: {
      targetType: 'company',
      targetId: company.id,
      status: 'open',
      note: 'User-submitted company requires moderation approval.',
      events: {
        create: {
          action: 'created',
          actorId: user.id,
          payloadJson: JSON.stringify({ companyId: company.id })
        }
      }
    }
  });

  return ok(company, 201);
}
