import { describe, expect, it } from 'vitest';
import { canUserEdit, canUserView } from '../lib/documents.js';

describe('Document Access Control Logic', () => {
  it('allows owners full edit and view permissions', () => {
    expect(canUserView('owner')).toBe(true);
    expect(canUserEdit('owner')).toBe(true);
  });

  it('allows edit permissions for users granted edit share', () => {
    expect(canUserView('edit')).toBe(true);
    expect(canUserEdit('edit')).toBe(true);
  });

  it('restricts users with read-only share from editing', () => {
    expect(canUserView('read')).toBe(true);
    expect(canUserEdit('read')).toBe(false);
  });

  it('denies view and edit permissions when user has no access', () => {
    expect(canUserView(null)).toBe(false);
    expect(canUserEdit(null)).toBe(false);
  });
});
