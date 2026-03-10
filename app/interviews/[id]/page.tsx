import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { RatingSummary } from '@/components/RatingSummary';

export const dynamic = 'force-dynamic';

export default async function InterviewPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const interview = await prisma.quitInterview.findUnique({
    where: { id },
    include: {
      company: true,
      companyResponse: true
    }
  });

  if (!interview || interview.status !== 'published') {
    notFound();
  }

  return (
    <section className="stack" style={{ marginTop: '1rem' }}>
      <article className="hero reveal">
        <h2>{interview.company.name}</h2>
        <p>
          {interview.separationType.toUpperCase()} • {interview.employmentStartYm} to {interview.employmentEndYm}
        </p>
        <div className="badge-row" style={{ marginTop: '0.5rem' }}>
          <RatingSummary
            cultureRating={interview.cultureRating}
            payRating={interview.payRating}
            managementRating={interview.managementRating}
            growthRating={interview.growthRating}
            workLifeRating={interview.workLifeRating}
          />
        </div>
      </article>

      <article className="card stack reveal">
        <h3>Reason for leaving</h3>
        <p>{interview.reasonForLeaving}</p>
        <h3>What was good</h3>
        <p>{interview.whatWasGood}</p>
        <h3>What should improve</h3>
        <p>{interview.whatShouldImprove}</p>
        <h3>Advice</h3>
        <p>{interview.advice}</p>
      </article>

      {interview.companyResponse && interview.companyResponse.status === 'published' ? (
        <article className="card stack reveal">
          <h3>Official company response</h3>
          <p>{interview.companyResponse.body}</p>
        </article>
      ) : null}
    </section>
  );
}
