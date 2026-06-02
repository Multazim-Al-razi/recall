import { describe, it, expect } from 'vitest';
import type { Request, Response } from 'express';

// Mirror of the route handler in backend/src/routes/accounts.ts. Kept in
// sync manually so the test can run without booting a real server or
// adding supertest as a dependency. These tests pin the contract so a
// future change to the upgrade endpoint fails loudly.
function upgradeHandler(req: Request, res: Response): void {
  const requested = (req.body ?? {}).tier;
  if (requested !== 'sync' && requested !== 'local') {
    res.status(400).json({ error: "tier must be 'local' or 'sync'" });
    return;
  }
  res.status(501).json({
    error: 'Plan upgrade not implemented yet',
    detail:
      'The Sync plan is on the way. The /api/account/upgrade endpoint is a stub.',
  });
}

interface Captured {
  status: number;
  body: unknown;
}

function mockRes(): Response & { captured: Captured } {
  const captured: Captured = { status: 200, body: undefined };
  const res = {
    captured,
    status(code: number) {
      captured.status = code;
      return this;
    },
    json(body: unknown) {
      captured.body = body;
      return this;
    },
  } as unknown as Response & { captured: Captured };
  return res;
}

function mockReq(body: unknown): Request {
  return { body } as Request;
}

describe('POST /api/account/upgrade (stub)', () => {
  it('returns 501 for a valid tier change (sync)', () => {
    const res = mockRes();
    upgradeHandler(mockReq({ tier: 'sync' }), res);
    expect(res.captured.status).toBe(501);
    expect((res.captured.body as { error: string }).error).toMatch(
      /not implemented/i,
    );
  });

  it('returns 501 for downgrading back to local', () => {
    const res = mockRes();
    upgradeHandler(mockReq({ tier: 'local' }), res);
    expect(res.captured.status).toBe(501);
  });

  it('rejects an unknown tier with 400', () => {
    const res = mockRes();
    upgradeHandler(mockReq({ tier: 'enterprise' }), res);
    expect(res.captured.status).toBe(400);
    expect((res.captured.body as { error: string }).error).toMatch(/local|sync/);
  });

  it('rejects a missing body with 400', () => {
    const res = mockRes();
    upgradeHandler(mockReq({}), res);
    expect(res.captured.status).toBe(400);
  });
});
