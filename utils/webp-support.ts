export function canUseWebP() {
  if (typeof window === 'undefined') {
    return false;
  }

  const elem = document.createElement('canvas');

  if (Boolean(elem.getContext && elem.getContext('2d'))) {
      // was able or not to get WebP representation
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } else {
      // very old browser like IE 8, canvas not supported
      return false;
  }
}

export async function supportsWebp(): Promise<boolean> {
  if (!self.createImageBitmap) return false;

  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());

  return createImageBitmap(blob).then(() => true, () => false);
}
