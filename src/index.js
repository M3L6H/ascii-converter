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

function init() {
  imageInputElt.addEventListener("change", (e) => handleImageChange(e));
  formElt.addEventListener("submit", (e) => handleFormSubmit(e));
}

addEventListener("load", () => init());