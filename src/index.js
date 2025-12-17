const asciiElt = document.getElementById("ascii");
const formElt = document.getElementById("image-form");
const imageInputElt = document.getElementById("image-input");
const submitElt = formElt.querySelector(".submit");
const canvasElt = document.getElementById("canvas");
const ctx = canvasElt.getContext('2d');

let image = null;

function handleFormSubmit(e) {
  e.preventDefault();
  submitElt.disabled = true;
  if (!image) return;

  canvasElt.width = image.width;
  canvasElt.height = image.height;

  ctx.drawImage(image, 0, 0);

  const ascii = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
  const width = 32;
  const height = Math.floor(width / image.width * image.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const luminances = new Array(width * height).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const [h, s, l] = rgbToHsl(r, g, b, a);
    const x = Math.floor(i / 4) % image.width;
    const y = Math.floor(Math.floor(i / 4) / image.width);
    const sx = Math.floor(x / image.width * width);
    const sy = Math.floor(y / image.height * height);
    luminances[sx + sy * width] += l;
  }
  
  const divisor = image.width / width * image.height / height;
  let html = "";
  
  for (let i = 0; i < luminances.length; ++i) {
    luminances[i] /= divisor;
    html += `<span class="char">${ascii[Math.max(ascii.length - 1, ascii.length * luminances[i])]}</span>`;
    if ((i + 1) % width === 0) html += "<br>";
  }

  asciiElt.innerHTML = html;

  URL.revokeObjectURL(image.src);
  image = null;
  imageInputElt.value = undefined;
} 

function handleImageChange(e) {
  const file = e.target.files[0];
  submitElt.disabled = true;
  if (!file) return;
  image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    submitElt.disabled = !file;
  };
}

function rgbToHsl(r, g, b, a = 1) {
  const rn = r / 255 * a, gn = g / 255 * a, bn = b / 255 * a;
  const m = Math.min(rn, gn, bn);
  const M = Math.max(rn, gn, bn);
  const l = (m + M) / 2;
  if (m === M) return [0, 0, l];
  const dm = M - m;
  const s = dm / (l > 0.5 ? (2 - M - m) : (M + m);
  let h;
  if (rn === M) {
    h = (gn - bn) / dm;
  } else if (gn === M) {
    h = 2 + (bn - rn) / dm;
  } else {
    h = 4 + (rn - gn) / dm;
  }
  h *= 60;
  if (h < 0) h += 360;
  return [h, s, l];
}

function init() {
  imageInputElt.addEventListener("change", (e) => handleImageChange(e));
  formElt.addEventListener("submit", (e) => handleFormSubmit(e));
}

addEventListener("load", () => init());