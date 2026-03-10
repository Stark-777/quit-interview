import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function CompanyPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      interviews: {
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!company || company.status !== 'approved') {
    notFound();
  }

  return (
    <section className="stack" style={{ marginTop: '1rem' }}>
      <article className="hero reveal">
        <h2>{company.name}</h2>
        <p>{company.website ?? 'No website listed'}</p>
      </article>

      <h3 className="section-title reveal">Published interviews</h3>
      <div className="grid">
        {company.interviews.map((interview) => (
          <article key={interview.id} className="card stack reveal">
            <p className="meta">
              {interview.separationType.toUpperCase()} • {interview.employmentStartYm} to {interview.employmentEndYm}
            </p>
            <p>{interview.reasonForLeaving.slice(0, 170)}...</p>
            <Link className="card-link" href={`/interviews/${interview.id}`}>
              Read full interview
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
