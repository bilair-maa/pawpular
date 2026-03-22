import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadAsZip } from '../utils/download';
import type { Pet } from '../types/pet';

function makePet(id: string, url = `https://example.com/${id}.jpg`): Pet {
  return { id, title: id, description: '', imageUrl: url, created: '2024-01-01T00:00:00Z' };
}

function makeBlob(type = 'image/jpeg'): Blob {
  return new Blob(['fake-image-data'], { type });
}

function mockFetchOk(blob: Blob) {
  return vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) } as unknown as Response);
}

function mockFetchFail() {
  return vi.fn().mockResolvedValue({ ok: false, status: 503 } as unknown as Response);
}

// jsdom doesn't implement URL.createObjectURL
const createObjectURL = vi.fn(() => 'blob:test-url');
const revokeObjectURL = vi.fn();

beforeEach(() => {
  Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, writable: true, configurable: true });
  Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, writable: true, configurable: true });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── single image ──────────────────────────────────────────────────────────────

describe('downloadAsZip – single image', () => {
  it('returns failedCount 0 on success', async () => {
    global.fetch = mockFetchOk(makeBlob());
    const result = await downloadAsZip([makePet('cat')]);
    expect(result).toEqual({ failedCount: 0 });
  });

  it('uses the filename from the URL', async () => {
    global.fetch = mockFetchOk(makeBlob());
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    await downloadAsZip([makePet('dog', 'https://cdn.example.com/pexels-photo-1234.jpeg')]);
    const anchor = appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('pexels-photo-1234.jpeg');
  });

  it('throws when the fetch fails', async () => {
    global.fetch = mockFetchFail();
    await expect(downloadAsZip([makePet('err')])).rejects.toThrow('HTTP 503');
  });
});

// ── multiple images ───────────────────────────────────────────────────────────

describe('downloadAsZip – multiple images', () => {
  it('returns failedCount 0 when all succeed', async () => {
    global.fetch = mockFetchOk(makeBlob());
    const result = await downloadAsZip([makePet('a'), makePet('b')]);
    expect(result).toEqual({ failedCount: 0 });
  });

  it('counts individual fetch failures in failedCount', async () => {
    let call = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      call++;
      if (call === 2) return Promise.resolve({ ok: false, status: 404 } as unknown as Response);
      return Promise.resolve({ ok: true, blob: () => Promise.resolve(makeBlob()) } as unknown as Response);
    });
    const result = await downloadAsZip([makePet('a'), makePet('b'), makePet('c')]);
    expect(result.failedCount).toBe(1);
  });

  it('throws when every image fails', async () => {
    global.fetch = mockFetchFail();
    await expect(
      downloadAsZip([makePet('x'), makePet('y')]),
    ).rejects.toThrow('All images failed to download');
  });
});
