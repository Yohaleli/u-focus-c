/**
 * Compresses an image file or DataURL to fit within max dimensions and target file size.
 * Uses HTML5 Canvas to downscale and re-encode as JPEG with variable quality.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio downscaling if image exceeds max bounds
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const bestRatio = Math.min(widthRatio, heightRatio);

        width = Math.round(width * bestRatio);
        height = Math.round(height * bestRatio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG data URL
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      // If dataURL string is still over 800KB, perform secondary aggressive compression
      if (dataUrl.length > 800000 && quality > 0.4) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      }

      resolve(dataUrl);
    };

    img.onerror = (err) => {
      reject(err);
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
