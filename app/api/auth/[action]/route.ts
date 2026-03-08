import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  authCompleteSchema,
  authStartSchema
} from '@/lib/validation';
import {
  clearSessionCookie,
  consumeMagicToken,
  createMagicToken,
  createSession,
  getCurrentUser,
  setSessionCookie
} from '@/lib/auth';
import { fail, ok } from '@/lib/http';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;

  if (action === 'start') {
    const payload = authStartSchema.safeParse(await request.json());
    if (!payload.success) {
      return fail('Invalid email payload', 422);
    }

    const token = await createMagicToken(payload.data.email);
    const base = process.env.APP_URL ?? 'http://localhost:3000';

    return ok({
      message: 'Magic link generated. Send via email in production.',
      devMagicLink: `${base}/auth/callback?token=${token}`
    });
  }

  if (action === 'complete') {
    const payload = authCompleteSchema.safeParse(await request.json());
    if (!payload.success) {
      return fail('Invalid token payload', 422);
    }

    const user = await consumeMagicToken(payload.data.token);
    if (!user) {
      return fail('Invalid or expired token', 401);
    }

    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    return ok({ user });
  }

  if (action === 'logout') {
    const current = await getCurrentUser();
    if (current) {
      await prisma.session.deleteMany({ where: { userId: current.id } });
    }
    await clearSessionCookie();
    return ok({ message: 'Signed out' });
  }

  return fail('Unsupported auth action', 404);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;

  if (action !== 'me') {
    return fail('Unsupported auth action', 404);
  }

  const user = await getCurrentUser();
  if (!user) {
    return fail('Unauthorized', 401);
  }

  return ok({ user });
}
