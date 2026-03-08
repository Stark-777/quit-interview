export function canCreateCompanyResponse(params: {
  interviewStatus: 'pending' | 'published' | 'rejected';
  hasClaim: boolean;
  hasExistingResponse: boolean;
}): { ok: boolean; reason?: string } {
  if (params.interviewStatus !== 'published') {
    return { ok: false, reason: 'Interview not published' };
  }

  if (!params.hasClaim) {
    return { ok: false, reason: 'Company claim required' };
  }

  if (params.hasExistingResponse) {
    return { ok: false, reason: 'Company response already exists' };
  }

  return { ok: true };
}
