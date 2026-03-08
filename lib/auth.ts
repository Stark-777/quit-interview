import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { UserRole, type User } from '@prisma/client';
import { prisma } from '@/lib/db';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'qi_session';

function sessionTtlMs(): number {
  return 1000 * 60 * 60 * 24 * 14;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createMagicToken(email: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await prisma.verificationToken.create({
    data: {
      email: email.toLowerCase(),
      token,
      expiresAt
    }
  });

  return token;
}

export async function consumeMagicToken(token: string): Promise<User | null> {
  const existing = await prisma.verificationToken.findUnique({ where: { token } });
  if (!existing || existing.expiresAt < new Date()) {
    return null;
  }

  await prisma.verificationToken.delete({ where: { id: existing.id } });

  const user = await prisma.user.upsert({
    where: { email: existing.email },
    update: {},
    create: {
      email: existing.email,
      role: UserRole.employee
    }
  });

  return user;
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + sessionTtlMs())
    }
  });

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) {
    return false;
  }
  return roles.includes(user.role);
}
