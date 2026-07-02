/**
 * Client-side image compression utility.
 * 
 * Compresses images before upload to handle high-quality camera photos (15-30MB+)
 * that might exceed server limits or cause slow uploads.
 * 
 * Strategy:
 * 1. If image is already under maxSizeKB, return as-is
 * 2. Draw image onto a canvas at reduced dimensions
 * 3. Export as JPEG with quality reduction
 * 4. Return compressed File object
 */

interface CompressOptions {
  /** Max file size in KB before compression kicks in (default: 2048 = 2MB) */
  maxSizeKB?: number;
  /** Max width/height in pixels (default: 1920) */
  maxDimension?: number;
  /** JPEG quality 0-1 (default: 0.8) */
  quality?: number;
  /** Output format (default: 'image/jpeg') */
  outputType?: string;
}

export const compressImage = (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  const {
    maxSizeKB = 2048,
    maxDimension = 1920,
    quality = 0.8,
    outputType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    // If file is already small enough, skip compression
    if (file.size / 1024 <= maxSizeKB) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw on canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas conversion failed'));
              return;
            }

            // Create a new File with a clean name
            const ext = outputType === 'image/png' ? '.png' : '.jpg';
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const compressedFile = new File(
              [blob],
              `${baseName}-compressed${ext}`,
              { type: outputType, lastModified: Date.now() }
            );

            console.log(
              `Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB (${width}x${height})`
            );

            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Compress multiple images in parallel.
 */
export const compressImages = async (
  files: File[],
  options: CompressOptions = {}
): Promise<File[]> => {
  return Promise.all(files.map((f) => compressImage(f, options)));
};
