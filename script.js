// script.js

// ------------- Pega aquí tu texto cifrado (cadena larga) -------------
const cipherBlock = document.getElementById("cipherBlock");
let cipherText = cipherBlock?.textContent.trim() || "";

// Secuencia objetivo: Shift + 7 + N
const TARGET_SEQUENCE = ["ShiftLeft", "Digit7", "KeyN"];
const TARGET_SEQUENCE_ALT = ["ShiftRight", "Digit7", "KeyN"];

let seq = [];
let seqTimer = null;
const SEQ_TIMEOUT = 2000; // ms

// Elementos DOM
const unlockForm = document.getElementById("unlockForm");
const contentDiv = document.getElementById("content");
const keyInput = document.getElementById("keyInput");
const unlockButton = document.getElementById("unlockButton");

// Escucha global de teclado
document.addEventListener("keydown", (e) => {
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") {
        return;
    }

    seq.push(e.code);
    if (seq.length > 3) {
        seq.shift();
    }

    if (seqTimer) {
        clearTimeout(seqTimer);
    }
    seqTimer = setTimeout(() => {
        seq = [];
        seqTimer = null;
    }, SEQ_TIMEOUT);

    const s = JSON.stringify(seq);
    const ok = s === JSON.stringify(TARGET_SEQUENCE) || s === JSON.stringify(TARGET_SEQUENCE_ALT);

    if (ok) {
        // Añadimos la clase para mostrar la imagen de fondo
        document.body.classList.add("unlocked-bg");

        // Mostramos el formulario y el texto cifrado
        if (unlockForm) unlockForm.style.display = "block";
        if (cipherBlock) cipherBlock.style.display = "block";

        // Enfocamos el input
        if (keyInput) {
            keyInput.focus();
            keyInput.select();
        }

        // Limpiamos la secuencia
        seq = [];
        if (seqTimer) {
            clearTimeout(seqTimer);
            seqTimer = null;
        }
    }
});

// Permitir Enter en el input
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

// Función principal
function unlock() {
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

        if (!plaintext) {
            alert("Clave incorrecta o desencriptación fallida.");
            return;
        }

        // Ocultamos todos los elementos y mostramos el contenido desencriptado
        if (unlockForm) unlockForm.style.display = "none";
        if (cipherBlock) cipherBlock.style.display = "none";
        if (contentDiv) {
            contentDiv.style.display = "block";
            contentDiv.innerHTML = plaintext;
        }

        // Limpiar la clase de fondo del body
        document.body.classList.remove("unlocked-bg");

        // limpiar input
        if (keyInput) keyInput.value = "";
    } catch (err) {
        console.error("Error desencriptando:", err);
        alert("Ocurrió un error al desencriptar. Revisa la consola para más detalles.");
    }
}


