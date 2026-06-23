import { describe, it, expect } from 'vitest';
import { generateSlug } from '../utils/slug';

describe('generateSlug', () => {
  it('converts workshop name to valid slug', () => {
    expect(generateSlug('React Masterclass')).toBe('react-masterclass');
    expect(generateSlug('Advanced Node.JS! 2026')).toBe('advanced-nodejs-2026');
    expect(generateSlug('  Extra   Spaces  ')).toBe('extra-spaces');
    expect(generateSlug('Special @#$ Characters')).toBe('special-characters');
  });

  it('handles empty strings', () => {
    expect(generateSlug('')).toBe('');
  });
});
