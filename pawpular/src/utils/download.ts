import JSZip from 'jszip';
import type { Pet } from '../types/pet';

// Creates a hidden link and clicks it to start a browser file download
function triggerDownload(objectUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

// Downloads one pet as a single file, or multiple pets bundled into a ZIP
export async function downloadAsZip(pets: Pet[]): Promise<{ failedCount: number }> {
  if (pets.length === 1) {
    const pet = pets[0];
    const res = await fetch(pet.imageUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const originalName = pet.imageUrl.split('/').pop()?.split('?')[0];
    const filename = originalName || `pawpular.${ext}`;
    triggerDownload(URL.createObjectURL(blob), filename);
    return { failedCount: 0 };
  }

  const zip = new JSZip();
  let failedCount = 0;

  await Promise.all(
    pets.map(async (pet, index) => {
      try {
        const res = await fetch(pet.imageUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
        const originalName = pet.imageUrl.split('/').pop()?.split('?')[0];
        const filename = originalName || `pet_${index + 1}.${ext}`;
        zip.file(filename, blob);
      } catch {
        failedCount++;
      }
    })
  );

  if (Object.keys(zip.files).length === 0) {
    throw new Error('All images failed to download. Please try again.');
  }
  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownload(URL.createObjectURL(content), 'pawpular-photos.zip');
  return { failedCount };
}
