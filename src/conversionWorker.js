function convert({
  ascii,
  data,
  imageHeight,
  imageWidth,
  lightness,
  ratio,
  size,
}) {
  const width =
    imageWidth < imageHeight
      ? size
      : Math.floor(((size * ratio) / imageHeight) * imageWidth);
  const height =
    imageWidth > imageHeight
      ? size
      : Math.floor((size / ratio / imageWidth) * imageHeight);

  const luminances = new Array(width * height).fill(0);
  const rs = new Array(width * height).fill(0);
  const gs = new Array(width * height).fill(0);
  const bs = new Array(width * height).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const [h, s, l] = rgbToHsl(r, g, b, a);
    const x = Math.floor(i / 4) % imageWidth;
    const y = Math.floor(Math.floor(i / 4) / imageWidth);
    const sx = Math.floor((x / imageWidth) * width);
    const sy = Math.floor((y / imageHeight) * height);
    const idx = sx + sy * width;
    luminances[idx] += l;
    const [rp, gp, bp] = hslToRgb(h, s, lightness * l);
    rs[idx] += rp * rp;
    gs[idx] += gp * gp;
    bs[idx] += bp * bp;
  }

  const divisor = (imageWidth / width) * (imageHeight / height);
  let html = "";

  for (let i = 0; i < luminances.length; ++i) {
    luminances[i] /= divisor;
    rs[i] = Math.sqrt(rs[i] / divisor);
    gs[i] = Math.sqrt(gs[i] / divisor);
    bs[i] = Math.sqrt(bs[i] / divisor);
    const index = Math.min(
      ascii.length - 1,
      Math.floor(ascii.length * luminances[i]),
    );
    html += `<span style="color: rgb(${rs[i]}, ${gs[i]}, ${bs[i]});">${ascii[index]}</span>`;
    if ((i + 1) % width === 0) html += "<br>";
  }

  return html;
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
function rgbToHsl(r, g, b) {
  ((r /= 255), (g /= 255), (b /= 255));
  const vmax = max(r, g, b),
    vmin = min(r, g, b);
  let h,
    s,
    l = (vmax + vmin) / 2;

  if (vmax === vmin) {
    return [0, 0, l]; // achromatic
  }

  const d = vmax - vmin;
  s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin);
  if (vmax === r) h = (g - b) / d + (g < b ? 6 : 0);
  if (vmax === g) h = (b - r) / d + 2;
  if (vmax === b) h = (r - g) / d + 4;
  h /= 6;

  return [h, s, l];
}

const { abs, min, max, round } = Math;

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return [round(r * 255), round(g * 255), round(b * 255)];
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

onmessage = function (event) {
  postMessage(convert(event.data));
};
