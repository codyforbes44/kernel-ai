/**
 * Favicon ICO Generator
 * Generates multi-resolution ICO files from canvas/image data
 * 
 * ICO format specification:
 * - Header: 6 bytes (reserved, type, image count)
 * - Directory entries: 16 bytes each (width, height, colors, reserved, planes, bpp, size, offset)
 * - Image data: BMP format without file header, or PNG
 */

export interface ICOGeneratorOptions {
  sizes: number[];
  includeTransparency?: boolean;
}

const DEFAULT_SIZES = [16, 32, 48];

/**
 * Creates an ICO file from an SVG string rendered at multiple resolutions
 */
export async function generateICOFromSVG(
  svgString: string,
  options: ICOGeneratorOptions = { sizes: DEFAULT_SIZES }
): Promise<Blob> {
  const { sizes } = options;
  const pngBuffers: ArrayBuffer[] = [];

  // Render SVG at each size
  for (const size of sizes) {
    const pngBuffer = await renderSVGToPNG(svgString, size);
    pngBuffers.push(pngBuffer);
  }

  return createICOBlob(sizes, pngBuffers);
}

/**
 * Creates an ICO file from multiple canvas elements
 */
export async function generateICOFromCanvases(
  canvases: HTMLCanvasElement[]
): Promise<Blob> {
  const sizes: number[] = [];
  const pngBuffers: ArrayBuffer[] = [];

  for (const canvas of canvases) {
    sizes.push(canvas.width);
    const pngBuffer = await canvasToPNGBuffer(canvas);
    pngBuffers.push(pngBuffer);
  }

  return createICOBlob(sizes, pngBuffers);
}

/**
 * Renders an SVG string to a PNG ArrayBuffer at the specified size
 */
async function renderSVGToPNG(svgString: string, size: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      
      try {
        const buffer = await canvasToPNGBuffer(canvas);
        resolve(buffer);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
}

/**
 * Converts a canvas to a PNG ArrayBuffer
 */
async function canvasToPNGBuffer(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read blob as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  });
}

/**
 * Creates an ICO blob from sizes and PNG buffers
 * Uses PNG format for each image (supported by modern browsers and Windows Vista+)
 */
function createICOBlob(sizes: number[], pngBuffers: ArrayBuffer[]): Blob {
  const imageCount = sizes.length;
  
  // Calculate total size
  // Header: 6 bytes
  // Directory: 16 bytes per image
  // Image data: sum of all PNG buffers
  const headerSize = 6;
  const directorySize = 16 * imageCount;
  const totalImageSize = pngBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const totalSize = headerSize + directorySize + totalImageSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // ICO Header
  view.setUint16(0, 0, true);          // Reserved, must be 0
  view.setUint16(2, 1, true);          // Type: 1 for ICO
  view.setUint16(4, imageCount, true); // Number of images

  // Directory entries and image data
  let currentOffset = headerSize + directorySize;

  for (let i = 0; i < imageCount; i++) {
    const size = sizes[i];
    const pngBuffer = pngBuffers[i];
    const directoryOffset = headerSize + (i * 16);

    // Directory entry (16 bytes)
    uint8[directoryOffset + 0] = size < 256 ? size : 0;  // Width (0 means 256)
    uint8[directoryOffset + 1] = size < 256 ? size : 0;  // Height (0 means 256)
    uint8[directoryOffset + 2] = 0;                       // Color palette (0 for no palette)
    uint8[directoryOffset + 3] = 0;                       // Reserved
    view.setUint16(directoryOffset + 4, 1, true);        // Color planes (1)
    view.setUint16(directoryOffset + 6, 32, true);       // Bits per pixel (32 for RGBA)
    view.setUint32(directoryOffset + 8, pngBuffer.byteLength, true);  // Image size
    view.setUint32(directoryOffset + 12, currentOffset, true);        // Image offset

    // Copy PNG data
    uint8.set(new Uint8Array(pngBuffer), currentOffset);
    currentOffset += pngBuffer.byteLength;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

/**
 * Downloads the ICO blob as a file
 */
export function downloadICO(blob: Blob, filename: string = 'favicon.ico'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates favicon SVG at a specific size
 * Uses the KernelLogoStatic design
 */
export function generateFaviconSVG(size: number): string {
  const borderRadius = Math.round(size * 0.156);
  const strokeWidth = Math.max(1, size * 0.024);
  const fontSize = Math.round(size * 0.25);
  const blurStdDev = Math.max(0.5, size * 0.016);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4ff"/>
      <stop offset="50%" style="stop-color:#ffd700"/>
      <stop offset="100%" style="stop-color:#00d4ff"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${blurStdDev}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="${size}" height="${size}" fill="#0a0a0f"/>
  
  <rect x="${size * 0.125}" y="${size * 0.125}" width="${size * 0.75}" height="${size * 0.75}" rx="${borderRadius}" ry="${borderRadius}" fill="none" stroke="url(#borderGradient)" stroke-width="${strokeWidth}"/>
  
  <rect x="${size * 0.156}" y="${size * 0.156}" width="${size * 0.688}" height="${size * 0.688}" rx="${borderRadius * 0.8}" ry="${borderRadius * 0.8}" fill="#0a0a0f"/>
  
  <g opacity="0.3" stroke="#00d4ff" fill="none">
    <path d="M${size/2} ${size * 0.25} L${size * 0.75} ${size/2} L${size/2} ${size * 0.75} L${size * 0.25} ${size/2} Z" stroke-width="${strokeWidth * 0.33}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.031}" fill="#00d4ff"/>
  </g>
  
  <text x="${size/2}" y="${size * 0.59}" font-family="ui-monospace, monospace" font-size="${fontSize}" font-weight="bold" fill="#00d4ff" text-anchor="middle" filter="url(#glow)">&gt;_</text>
</svg>`;
}
