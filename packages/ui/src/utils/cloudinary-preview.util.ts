/** Keep the original host and asset path; unsupported sources use their reserved box. */
export function cloudinaryPreview(src: string): string | undefined {
  try {
    const url = new URL(src);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'res.cloudinary.com' ||
      !url.pathname.includes('/image/upload/')
    )
      return undefined;
    url.pathname = url.pathname.replace('/upload/', '/upload/w_32,c_limit,e_blur:300,q_1/');
    return url.toString();
  } catch {
    return undefined;
  }
}
