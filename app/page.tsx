import Link from 'next/link';
import { prisma } from '@/lib/db';
import { RatingSummary } from '@/components/RatingSummary';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [companies, interviews] = await Promise.all([
    prisma.company.findMany({
      where: { status: 'approved' },
      take: 15,
      orderBy: { name: 'asc' }
    }),
    prisma.quitInterview.findMany({
      where: { status: 'published' },
      include: {
        company: true
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    })
  ]);

  return (
    <section className="stack">
      <h2>Latest Published Quit Interviews</h2>
      <div className="grid">
        {interviews.map((interview) => (
          <article key={interview.id} className="card stack">
            <h3>
              <Link href={`/interviews/${interview.id}`}>{interview.company.name}</Link>
            </h3>
            <p className="meta">
              {interview.separationType.toUpperCase()} • {interview.employmentStartYm} to {interview.employmentEndYm}
            </p>
            <RatingSummary
              cultureRating={interview.cultureRating}
              payRating={interview.payRating}
              managementRating={interview.managementRating}
              growthRating={interview.growthRating}
              workLifeRating={interview.workLifeRating}
            />
            <p>{interview.reasonForLeaving.slice(0, 140)}...</p>
          </article>
        ))}
      </div>

      <h2 style={{ marginTop: '1rem' }}>Approved Companies</h2>
      <div className="grid">
        {companies.map((company) => (
          <article className="card" key={company.id}>
            <h3>
              <Link href={`/companies/${company.slug}`}>{company.name}</Link>
            </h3>
            <p className="meta">{company.website ?? 'No website listed'}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
