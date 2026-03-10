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
    <section className="stack" style={{ marginTop: '1rem' }}>
      <article className="hero reveal">
        <h2>Honest exits, healthier companies.</h2>
        <p>
          Quit Interview is a verified-anonymous space where former employees share structured exit feedback and companies
          publicly respond. Every post is moderated before publication.
        </p>
        <div className="badge-row" style={{ marginTop: '0.8rem' }}>
          <span className="badge">Verified identity</span>
          <span className="badge">Anonymous public voice</span>
          <span className="badge">Pre-publish moderation</span>
        </div>
      </article>

      <h2 className="section-title reveal">Latest Published Interviews</h2>
      <div className="grid">
        {interviews.map((interview) => (
          <article key={interview.id} className="card stack reveal">
            <p className="meta">
              {interview.separationType.toUpperCase()} • {interview.employmentStartYm} to {interview.employmentEndYm}
            </p>
            <h3>
              <Link className="card-link" href={`/interviews/${interview.id}`}>
                {interview.company.name}
              </Link>
            </h3>
            <RatingSummary
              cultureRating={interview.cultureRating}
              payRating={interview.payRating}
              managementRating={interview.managementRating}
              growthRating={interview.growthRating}
              workLifeRating={interview.workLifeRating}
            />
            <p>{interview.reasonForLeaving.slice(0, 160)}...</p>
          </article>
        ))}
      </div>

      <h2 className="section-title reveal">Approved Companies</h2>
      <div className="grid">
        {companies.map((company) => (
          <article className="card stack reveal" key={company.id}>
            <h3>
              <Link className="card-link" href={`/companies/${company.slug}`}>
                {company.name}
              </Link>
            </h3>
            <p className="meta">{company.website ?? 'No website listed'}</p>
            <Link className="inline-code" href={`/companies/${company.slug}`}>
              View company profile
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
