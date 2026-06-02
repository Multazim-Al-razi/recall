import { describe, it, expect } from 'vitest';
import { validateAccountPatch } from '../src/validate.js';

/**
 * The `tier` field on AccountRecord is the single place the eventual Sync
 * plan will live. These tests pin the validator's behaviour so a future
 * change that accidentally allows a free-form string, drops the field
 * silently, or breaks the default-to-local invariant is caught before
 * it ships.
 */
describe('validateAccountPatch — tier field', () => {
  it('accepts "local" and stores it verbatim', () => {
    const patch = validateAccountPatch({ tier: 'local' });
    expect(patch.tier).toBe('local');
  });

  it('accepts "sync" and stores it verbatim', () => {
    const patch = validateAccountPatch({ tier: 'sync' });
    expect(patch.tier).toBe('sync');
  });

  it('drops unknown tier values silently rather than persisting garbage', () => {
    const patch = validateAccountPatch({ tier: 'enterprise' });
    expect(patch.tier).toBeUndefined();
  });

  it('drops non-string tier values', () => {
    expect(validateAccountPatch({ tier: 1 }).tier).toBeUndefined();
    expect(validateAccountPatch({ tier: null }).tier).toBeUndefined();
    expect(validateAccountPatch({ tier: undefined }).tier).toBeUndefined();
    expect(validateAccountPatch({ tier: { plan: 'sync' } }).tier).toBeUndefined();
  });

  it('does not regress the other fields it already handled', () => {
    const patch = validateAccountPatch({
      tier: 'sync',
      name: '  Ada Lovelace  ',
      currency: 'eur',
    });
    expect(patch.tier).toBe('sync');
    expect(patch.name).toBe('Ada Lovelace');
    expect(patch.currency).toBe('EUR');
  });
});
