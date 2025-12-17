const asciiElt = document.getElementById("ascii");
const asciiCharsElt = document.getElementById("ascii-chars");
const fontSizeElt = document.getElementById("font-size");
const formElt = document.getElementById("image-form");
const imageInputElt = document.getElementById("image-input");
const lightnessElt = document.getElementById("lightness");
const sizeElt = document.getElementById("size");
const submitElt = formElt.querySelector(".submit");
const canvasElt = document.getElementById("canvas");
const ctx = canvasElt.getContext("2d", { willReadFrequently: true });

let image = null;

/**
 * @returns Promise<string> HTML of ASCII
 */
function convertImage(data) {
  return new Promise((resolve) => {
    const conversionWorker = new Worker("conversionWorker.js");
    conversionWorker.postMessage(data);
    conversionWorker.onmessage = function (event) {
      resolve(event.data);
    };
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();
  submitElt.disabled = true;
  submitElt.textContent = "Loading...";
  imageInputElt.disabled = true;
  if (!image) return;

  canvasElt.width = image.width;
  canvasElt.height = image.height;

  ctx.drawImage(image, 0, 0);

  const ascii = asciiCharsElt.value;
  const fontSize = fontSizeElt.value || 8;
  const ratio = getCharacterRatio(fontSize);
  const lightness = parseInt(lightnessElt.value) / 50 || 1;
  const size = sizeElt.value || 128;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const html = await convertImage({
    ascii,
    data,
    imageHeight: image.height,
    imageWidth: image.width,
    lightness,
    ratio,
    size,
  });

  document.querySelector(".title").classList.add("hidden");
  asciiElt.innerHTML = html;
  asciiElt.style.fontSize = `${fontSize}px`;
  submitElt.textContent = "Submit";
  imageInputElt.disabled = false;

  URL.revokeObjectURL(image.src);
  image = null;
  imageInputElt.value = "";
}

function getCharacterRatio(fontSize) {
  const span = document.createElement("span");
  span.textContent = "@";
  span.style.fontSize = `${fontSize}px`;
  span.style.fontFamily = "monospace";
  span.style.position = "absolute";

  document.body.appendChild(span);

  // Get the dimensions
  const rect = span.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Clean up by removing the element
  document.body.removeChild(span);

  return height / width;
}

function handleImageChange(e) {
  const file = e.target.files[0];
  submitElt.disabled = true;
  if (!file) return;
  image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    submitElt.disabled = !file && !!asciiCharsElt.value;
  };
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

function init() {
  asciiCharsElt.value =
    " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
  fontSizeElt.value = 8;
  lightnessElt.value = 50;
  sizeElt.value = 128;

  imageInputElt.addEventListener("change", (e) => handleImageChange(e));
  formElt.addEventListener("submit", (e) => handleFormSubmit(e));
}

addEventListener("load", () => init());
