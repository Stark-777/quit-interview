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
    <section className="stack">
      <div className="card stack">
        <h2>{company.name}</h2>
        <p className="meta">{company.website ?? 'No website listed'}</p>
      </div>

      <h3>Published interviews</h3>
      <div className="grid">
        {company.interviews.map((interview) => (
          <article key={interview.id} className="card stack">
            <p className="meta">
              {interview.separationType} • {interview.employmentStartYm} to {interview.employmentEndYm}
            </p>
            <p>{interview.reasonForLeaving.slice(0, 160)}...</p>
            <Link href={`/interviews/${interview.id}`}>Read interview</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
