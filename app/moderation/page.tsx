import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const queue = await prisma.moderationCase.findMany({
    where: { status: 'open' },
    orderBy: { createdAt: 'asc' },
    include: {
      events: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return (
    <section className="stack" style={{ marginTop: '1rem' }}>
      <article className="hero reveal">
        <h2>Moderation queue</h2>
        <p>Pre-publish decisions for interviews, company profiles, responses, claims, and role actions.</p>
      </article>

      <div className="grid">
        {queue.map((item) => (
          <article className="card stack reveal" key={item.id}>
            <div className="badge-row">
              <span className="badge">{item.targetType}</span>
              <span className="badge">open</span>
            </div>
            <p className="meta">Case #{item.id}</p>
            <p className="meta">Target: {item.targetId}</p>
            <p className="meta">Reason: {item.reason ?? 'none'}</p>
            <p>{item.note ?? 'No note'}</p>
            <p className="inline-code">POST /api/moderation/cases/{item.id}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
