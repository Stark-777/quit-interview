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
    <section className="stack">
      <h2>Submit a Quit Interview</h2>
      <p className="meta">
        V1 submission flow includes sign-in, employment verification, and moderation. Use API endpoints below for full flow.
      </p>

      <form className="card stack" onSubmit={startAuth}>
        <label className="label" htmlFor="email">
          Work or personal email for magic link sign-in
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

      <form className="card stack" onSubmit={completeAuth}>
        <label className="label" htmlFor="token">
          Paste auth token from dev magic link
        </label>
        <input
          className="input"
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <button className="button" type="submit">
          Complete sign-in
        </button>
      </form>

      {message ? <div className="card">{message}</div> : null}

      <article className="card stack">
        <h3>Next API steps after sign-in</h3>
        <code>POST /api/verifications/start</code>
        <code>POST /api/verifications/complete</code>
        <code>POST /api/interviews</code>
      </article>
    </section>
  );
}
