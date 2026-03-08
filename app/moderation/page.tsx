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
    <section className="stack">
      <h2>Moderation Queue</h2>
      <p className="meta">Pre-publish review queue for companies, interviews, claims, and company responses.</p>

      <div className="grid">
        {queue.map((item) => (
          <article className="card stack" key={item.id}>
            <h3>{item.targetType}</h3>
            <p className="meta">Case #{item.id}</p>
            <p className="meta">Target ID: {item.targetId}</p>
            <p className="meta">Reason: {item.reason ?? 'none'}</p>
            <p>{item.note ?? 'No note'}</p>
            <code>POST /api/moderation/cases/{item.id}</code>
          </article>
        ))}
      </div>
    </section>
  );
}
