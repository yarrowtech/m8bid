const CLOUD_NAME = "dhieheffr";
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

// Optimized image URL: auto format (webp/avif), auto quality, capped width.
export const cldImage = (publicId, width) =>
  `${BASE}/image/upload/f_auto,q_auto${width ? `,c_limit,w_${width}` : ""}/${publicId}`;

export const cldVideo = (publicId) => `${BASE}/video/upload/f_auto,q_auto/${publicId}`;
