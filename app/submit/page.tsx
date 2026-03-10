'use client';

import { FormEvent, useState } from 'react';

async function postJson(path: string, body: unknown) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  return res.json();
}

export default function SubmitPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  async function startAuth(e: FormEvent) {
    e.preventDefault();
    const response = await postJson('/api/auth/start', { email });
    setMessage(response.data?.devMagicLink ?? response.error ?? 'Check email');
  }

  async function completeAuth(e: FormEvent) {
    e.preventDefault();
    const response = await postJson('/api/auth/complete', { token });
    setMessage(response.error ?? `Signed in as ${response.data?.user?.email}`);
  }

  return (
    <section className="stack" style={{ marginTop: '1rem' }}>
      <article className="hero reveal">
        <h2>Submit a quit interview</h2>
        <p>
          You verify identity privately, publish anonymously, and your review enters moderation before public release.
        </p>
      </article>

      <div className="two-col">
        <form className="card stack reveal" onSubmit={startAuth}>
          <h3>Step 1: Request magic link</h3>
          <label className="label" htmlFor="email">
            Work or personal email
          </label>
          <input
            className="input"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="button" type="submit">
            Send magic link
          </button>
        </form>

        <form className="card stack reveal" onSubmit={completeAuth}>
          <h3>Step 2: Complete sign-in</h3>
          <label className="label" htmlFor="token">
            Token from dev magic link
          </label>
          <input className="input" id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <button className="button" type="submit">
            Complete sign-in
          </button>
        </form>
      </div>

      {message ? (
        <article className="card reveal">
          <h3>Result</h3>
          <p>{message}</p>
        </article>
      ) : null}

      <article className="card stack reveal">
        <h3>Next API steps after sign-in</h3>
        <p className="inline-code">POST /api/verifications/start</p>
        <p className="inline-code">POST /api/verifications/complete</p>
        <p className="inline-code">POST /api/interviews</p>
      </article>
    </section>
  );
}
