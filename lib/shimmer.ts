export function shimmer(w: number, h: number) {
  return `\
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">\
  <defs>\
    <linearGradient id="g">\
      <stop stop-color="#f6f7f8" offset="20%" />\
      <stop stop-color="#edeef1" offset="50%" />\
      <stop stop-color="#f6f7f8" offset="70%" />\
    </linearGradient>\
  </defs>\
  <rect width="${w}" height="${h}" fill="#f6f7f8" />\
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />\
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />\
</svg>`;
}

export function toBase64(str: string) {
  if (typeof window === 'undefined') {
    return Buffer.from(str).toString('base64');
  } else {
    return window.btoa(str);
  }
}
