// script.js
// ------------- Pega aquí tu texto cifrado (cadena larga) -------------
// Usamos una constante para una mejor práctica.
const cipherBlock = document.getElementById("cipherBlock");
// Usa un operador de encadenamiento opcional para una sintaxis más limpia.
let cipherText = cipherBlock?.textContent.trim() || "";

// Secuencia objetivo: Shift + 7 + N (aceptamos ShiftLeft o ShiftRight)
const TARGET_SEQUENCE = ["ShiftLeft", "Digit7", "KeyN"];
const TARGET_SEQUENCE_ALT = ["ShiftRight", "Digit7", "KeyN"];

let seq = [];
let seqTimer = null;
const SEQ_TIMEOUT = 2000; // ms para resetear la secuencia si tardas mucho

// Elementos DOM
const unlockForm = document.getElementById("unlockForm");
const contentDiv = document.getElementById("content");
const keyInput = document.getElementById("keyInput");
const unlockImage = document.getElementById("unlockImage");
const unlockButton = document.getElementById("unlockButton"); // Añadido para el botón

// Función para manejar el estado de los elementos
function setInitialState() {
  if (unlockForm) unlockForm.style.display = "none";
  if (cipherBlock) cipherBlock.style.display = "none";
  if (contentDiv) contentDiv.style.display = "none";
  if (unlockImage) unlockImage.style.display = "none";
}

// Llamar a la función al inicio del script
setInitialState();

// Escucha global de teclado
document.addEventListener("keydown", (e) => {
  const tag = e.target?.tagName;
  // Mejoramos la condición para evitar que el script se active en inputs
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") {
    return;
  }

  // Si la tecla presionada es "Shift", no la agregues al array 'seq'
  if (e.code.startsWith("Shift")) {
    // Si la tecla "Shift" ya está en la secuencia, no la agregues de nuevo.
    if (!seq.includes(e.code)) {
      seq.push(e.code);
    }
  } else {
    // Si la tecla no es "Shift", solo la agregamos a la secuencia.
    seq.push(e.code);
  }

  // Mantener solo las últimas 3 teclas.
  if (seq.length > 3) {
    seq = seq.slice(-3);
  }

  // Reiniciar timeout
  if (seqTimer) {
    clearTimeout(seqTimer);
  }

  seqTimer = setTimeout(() => {
    seq = [];
    seqTimer = null;
  }, SEQ_TIMEOUT);

  // Comprobar secuencia. Usamos `JSON.stringify` para comparar arrays de forma simple.
  const s = JSON.stringify(seq);
  const ok = s === JSON.stringify(TARGET_SEQUENCE) || s === JSON.stringify(TARGET_SEQUENCE_ALT);

  if (ok) {
    // Mostrar formulario y elementos relacionados.
    if (unlockForm) unlockForm.style.display = "block";
    if (cipherBlock) cipherBlock.style.display = "block";
    if (unlockImage) {
      unlockImage.style.display = "block";
      unlockImage.style.pointerEvents = "none";
    }

    // Enfocar el input.
    if (keyInput) {
      keyInput.focus();
      keyInput.select();
    }

    // Limpiar secuencia y timeout.
    seq = [];
    if (seqTimer) {
      clearTimeout(seqTimer);
      seqTimer = null;
    }
  }
});

// Permitir Enter en el input para ejecutar unlock
if (keyInput) {
  keyInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      unlock();
    }
  });
}

// Escuchar el click del botón
if (unlockButton) {
  unlockButton.addEventListener("click", unlock);
}

// Función principal: desencriptar y mostrar HTML
function unlock() {
  // Verificamos si CryptoJS existe antes de usarlo.
  if (typeof CryptoJS === 'undefined' || !cipherText) {
    alert("CryptoJS no está cargado o no hay texto cifrado.");
    return;
  }

  const key = keyInput?.value.trim() || "";
  if (!key) {
    alert("Ingresa la clave.");
    return;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);

    // Verificamos si la desencriptación fue exitosa (el resultado no está vacío)
    if (!plaintext) {
      alert("Clave incorrecta o desencriptación fallida.");
      return;
    }

    // Ocultar elementos y mostrar contenido desencriptado.
    if (unlockForm) unlockForm.style.display = "none";
    if (cipherBlock) cipherBlock.style.display = "none";
    if (contentDiv) {
      contentDiv.style.display = "block";
      contentDiv.innerHTML = plaintext;
    }

    // Limpiar input
    if (keyInput) keyInput.value = "";
  } catch (err) {
    console.error("Error desencriptando:", err);
    alert("Ocurrió un error al desencriptar. Revisa la consola para más detalles.");
  }
}

