import { describe, it, expect } from 'vitest';
import { formatBytes } from '../utils/formatBytes';

describe('formatBytes', () => {
  it('formats bytes under 1 MB as KB', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('rounds KB to nearest integer', () => {
    expect(formatBytes(1536)).toBe('2 KB');
    expect(formatBytes(1024 * 300)).toBe('300 KB');
  });

  it('formats 1 MB exactly', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats values over 1 MB with one decimal place', () => {
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB');
    expect(formatBytes(1024 * 1024 * 10)).toBe('10.0 MB');
  });

  it('formats 0 bytes as 0 KB', () => {
    expect(formatBytes(0)).toBe('0 KB');
  });

  it('formats a real photo size correctly', () => {
    // 4955797 bytes (pexels-photo-1741205) → 4.7 MB
    const result = formatBytes(4955797);
    expect(result).toBe('4.7 MB');
  });
});
