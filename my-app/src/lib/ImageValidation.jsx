
// Allowed image types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 1 MB because im using local storage without any backend/database
export const MAX_IMAGE_BYTES = 1_000_000;

// formating bytes so user can know the size 
export function formatBytes(num) {
  if (typeof num !== 'number' || !isFinite(num)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let n = num;
  while (n >= 1024 && idx < units.length - 1) {
    n /= 1024;
    idx++;
  }
  // show 1 decimal for KB/MB/GB, none for bytes
  const precision = idx === 0 ? 0 : 1;
  return `${n.toFixed(precision)} ${units[idx]}`;
}

/**
 * check if file meets requirements  */
export function validateImageFile(file) {
  if (!file) {
    return {
      ok: false,
      code: 'EMPTY',
      message: 'No file provided.',
    };
  }

  //  check image type first
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      code: 'TYPE',
      message: 'Unsupported image type. Please use JPEG, PNG, or WEBP.',
    };
  }

  // Size check
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      code: 'SIZE',
      message: `Image is too large (${formatBytes(file.size)}). Max allowed is ${formatBytes(MAX_IMAGE_BYTES)}.`,
    };
  }

  return { ok: true };
}
