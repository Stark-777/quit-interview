import { z } from 'zod';

export const authStartSchema = z.object({
  email: z.string().email()
});

export const authCompleteSchema = z.object({
  token: z.string().min(16)
});

export const companyCreateSchema = z.object({
  name: z.string().min(2).max(120),
  website: z.string().url().optional()
});

const rating = z.number().int().min(1).max(5);

export const interviewCreateSchema = z.object({
  companyId: z.string().min(1),
  employmentCheckId: z.string().min(1),
  separationType: z.enum(['quit', 'layoff', 'termination', 'other']),
  employmentStartYm: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  employmentEndYm: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  roleTitle: z.string().max(120).optional(),
  department: z.string().max(120).optional(),
  cultureRating: rating,
  payRating: rating,
  managementRating: rating,
  growthRating: rating,
  workLifeRating: rating,
  reasonForLeaving: z.string().min(20).max(2000),
  whatWasGood: z.string().min(20).max(2000),
  whatShouldImprove: z.string().min(20).max(2000),
  advice: z.string().min(20).max(2000),
  termsAccepted: z.literal(true),
  defamationPolicyAccepted: z.literal(true)
});

export const companyResponseSchema = z.object({
  body: z.string().min(20).max(3000)
});

export const verificationStartSchema = z.object({
  companyId: z.string().min(1),
  workEmail: z.string().email(),
  optionalDocUrl: z.string().url().optional()
});

export const verificationCompleteSchema = z.object({
  token: z.string().min(16)
});

export const reportSchema = z.object({
  targetType: z.enum(['quit_interview', 'company_response']),
  targetId: z.string().min(1),
  reason: z.string().min(10).max(500)
});

export const moderationDecisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z
    .enum([
      'policy_pass',
      'pii_detected',
      'harassment',
      'defamation_risk',
      'spam',
      'duplicate',
      'insufficient_evidence'
    ])
    .optional(),
  note: z.string().max(1000).optional()
});

export const mergeCompaniesSchema = z.object({
  sourceCompanyId: z.string().min(1),
  targetCompanyId: z.string().min(1),
  alias: z.string().min(2).max(120).optional()
});

export const companyClaimSchema = z.object({
  companyId: z.string().min(1),
  evidenceUrl: z.string().url().optional()
});

export const roleChangeSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['employee', 'company_admin', 'moderator'])
});
