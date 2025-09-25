// script.js
// ------------- Pega aquí tu texto cifrado (cadena larga) -------------
const cipherBlock = document.getElementById("cipherBlock");
let cipherText = cipherBlock ? cipherBlock.textContent.trim() : "";

// Secuencia objetivo: Shift + 7 + N (aceptamos ShiftLeft o ShiftRight)
let seq = [];
let seqTimer = null;
const SEQ_TIMEOUT = 2000; // ms para resetear la secuencia si tardas mucho

// Elementos DOM
const unlockForm = document.getElementById("unlockForm");
const contentDiv = document.getElementById("content");
const keyInput = document.getElementById("keyInput");
const unlockImage = document.getElementById("unlockImage");

// Ocultamos al inicio por si no lo hiciste en CSS
if (unlockForm) unlockForm.style.display = "none";
if (cipherBlock) cipherBlock.style.display = "none";
if (contentDiv) contentDiv.style.display = "none";
if (unlockImage) unlockImage.style.display = "none";

// Escucha global de teclado
document.addEventListener("keydown", (e) => {
  const tag = (document.activeElement && document.activeElement.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  seq.push(e.code);

  // Mantener solo las últimas 3 teclas
  if (seq.length > 3) seq.shift();

  // reiniciar timeout
  if (seqTimer) clearTimeout(seqTimer);
  seqTimer = setTimeout(() => {
    seq = [];
    seqTimer = null;
  }, SEQ_TIMEOUT);

  // Comprobar secuencia
  const s = seq.join(",");
  const ok1 = s === "ShiftLeft,Digit7,KeyN";
  const ok2 = s === "ShiftRight,Digit7,KeyN";

  if (ok1 || ok2) {
    // Mostrar formulario
    if (unlockForm) unlockForm.style.display = "block";

    // Mostrar bloque cifrado
    if (cipherBlock) cipherBlock.style.display = "block";

    // Mostrar imagen como fondo, pero sin bloquear clicks
    if (unlockImage) {
      unlockImage.style.display = "block";
      unlockImage.style.pointerEvents = "none";
    }

    // Enfocar input
    if (keyInput) {
      keyInput.focus();
      keyInput.select();
    }

    // Limpiar secuencia
    seq = [];
    if (seqTimer) { clearTimeout(seqTimer); seqTimer = null; }
  }
});

// Permitir Enter en el input para ejecutar unlock
if (keyInput) {
  keyInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") unlock();
  });
}

// Función principal: desencriptar y mostrar HTML
function unlock() {
  const key = (keyInput && keyInput.value) || "";
  if (!key) {
    alert("Ingresa la clave.");
    return;
  }

  if (!cipherText || cipherText.trim() === "") {
    alert("No hay texto cifrado. Revisa que 'cipherText' tenga el valor correcto.");
    return;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);

    if (!plaintext) {
      alert("Clave incorrecta o desencriptación fallida.");
      return;
    }

    // Ocultar formulario/bloque y mostrar contenido desencriptado
    if (unlockForm) unlockForm.style.display = "none";
    if (cipherBlock) cipherBlock.style.display = "none";
    if (contentDiv) {
      contentDiv.style.display = "block";
      contentDiv.innerHTML = plaintext;
    }

    // limpiar input
    if (keyInput) keyInput.value = "";
  } catch (err) {
    console.error("Error desencriptando:", err);
    alert("Ocurrió un error al desencriptar.");
  }
}

