import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@quitinterview.local' },
    update: { role: 'moderator' },
    create: {
      email: 'moderator@quitinterview.local',
      role: 'moderator'
    }
  });

  const company = await prisma.company.upsert({
    where: { slug: 'example-corp' },
    update: { status: 'approved', claimStatus: 'claimed' },
    create: {
      name: 'Example Corp',
      slug: 'example-corp',
      website: 'https://example.com',
      status: 'approved',
      claimStatus: 'claimed'
    }
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@quitinterview.local' },
    update: {},
    create: {
      email: 'employee@quitinterview.local',
      role: 'employee'
    }
  });

  const verification = await prisma.employmentVerification.create({
    data: {
      userId: employee.id,
      companyId: company.id,
      workEmail: 'employee@example.com',
      token: `seed-token-${Date.now()}`,
      status: 'verified',
      reviewedById: moderator.id,
      reviewedAt: new Date()
    }
  });

  const interview = await prisma.quitInterview.create({
    data: {
      companyId: company.id,
      userId: employee.id,
      employmentCheckId: verification.id,
      separationType: 'quit',
      employmentStartYm: '2022-01',
      employmentEndYm: '2024-05',
      roleTitle: 'Software Engineer',
      department: 'Platform',
      cultureRating: 4,
      payRating: 3,
      managementRating: 3,
      growthRating: 4,
      workLifeRating: 4,
      reasonForLeaving: 'I wanted stronger mentorship and clearer project ownership.',
      whatWasGood: 'The team was collaborative and there was healthy engineering rigor.',
      whatShouldImprove: 'Manager training and compensation transparency need investment.',
      advice: 'Publish performance expectations and normalize upward feedback.',
      status: 'published'
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'hr@example.com' },
    update: { role: 'company_admin' },
    create: {
      email: 'hr@example.com',
      role: 'company_admin'
    }
  });

  await prisma.companyClaim.upsert({
    where: {
      companyId_userId: {
        companyId: company.id,
        userId: admin.id
      }
    },
    update: { status: 'claimed' },
    create: {
      companyId: company.id,
      userId: admin.id,
      status: 'claimed'
    }
  });

  await prisma.companyResponse.upsert({
    where: { quitInterviewId: interview.id },
    update: {},
    create: {
      quitInterviewId: interview.id,
      companyId: company.id,
      authoredById: admin.id,
      body: 'Thanks for the candid feedback. We are updating manager coaching and leveling docs.',
      status: 'published'
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
