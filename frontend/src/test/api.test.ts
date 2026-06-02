import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { subscriptionsApi, accountApi, healthApi } from '@/lib/api';

/**
 * The API client wraps fetch with a base path, JSON headers, a timeout, and
 * error unwrapping. These tests stub global.fetch to assert the wire contract
 * (paths, methods, bodies) and the error/edge behavior without a live backend.
 */

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('subscriptionsApi.list', () => {
  it('requests the /api/subscriptions path with no query by default', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ subscriptions: [] }));
    const result = await subscriptionsApi.list();
    expect(result).toEqual({ subscriptions: [] });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/subscriptions');
  });

  it('appends a status query when provided', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ subscriptions: [] }));
    await subscriptionsApi.list('active');
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/subscriptions?status=active');
  });
});

describe('subscriptionsApi.create', () => {
  it('POSTs JSON with a Content-Type header', async () => {
    const created = { id: 'x1', name: 'Netflix' };
    fetchMock.mockResolvedValue(jsonResponse(created));
    const result = await subscriptionsApi.create({ name: 'Netflix', amount: 15.99 });
    expect(result).toEqual(created);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/subscriptions');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ name: 'Netflix', amount: 15.99 });
  });
});

describe('subscriptionsApi.update / delete', () => {
  it('PATCHes the correct id path', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'abc', name: 'New' }));
    await subscriptionsApi.update('abc', { name: 'New' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/subscriptions/abc');
    expect(options.method).toBe('PATCH');
  });

  it('DELETEs the correct id path', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true }));
    const result = await subscriptionsApi.delete('abc');
    expect(result).toEqual({ success: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/subscriptions/abc');
    expect(options.method).toBe('DELETE');
  });
});

describe('accountApi', () => {
  it('GETs /api/account', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'default' }));
    await accountApi.get();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/account');
  });

  it('POSTs onboarding completion to the right path', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'default', onboarded: true }));
    await accountApi.completeOnboarding({ name: 'Ada' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/account/complete-onboarding');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ name: 'Ada' });
  });

  it('POSTs a reset', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'default', onboarded: false }));
    await accountApi.reset();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/account/reset');
    expect(options.method).toBe('POST');
  });
});

describe('healthApi', () => {
  it('checks /api/health', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', timestamp: 't' }));
    const result = await healthApi.check();
    expect(result.status).toBe('ok');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/health');
  });
});

describe('error handling', () => {
  it('throws the server-provided error message on a non-ok response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'Subscription not found' }, false, 404));
    await expect(subscriptionsApi.get('missing')).rejects.toThrow('Subscription not found');
  });

  it('falls back to a status-based message when the body has no error field', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 500));
    await expect(subscriptionsApi.list()).rejects.toThrow(/API error: 500/);
  });

  it('tolerates a non-JSON error body without throwing a parse error', async () => {
    const res = {
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON');
      },
    } as unknown as Response;
    fetchMock.mockResolvedValue(res);
    await expect(subscriptionsApi.list()).rejects.toThrow('Bad Gateway');
  });

  it('propagates a network rejection (offline backend)', async () => {
    fetchMock.mockRejectedValue(new Error('Failed to fetch'));
    await expect(accountApi.get()).rejects.toThrow('Failed to fetch');
  });
});

describe('request options', () => {
  it('always attaches an abort signal so a dead backend cannot hang the UI', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ subscriptions: [] }));
    await subscriptionsApi.list();
    const [, options] = fetchMock.mock.calls[0];
    expect(options.signal).toBeDefined();
  });
});
