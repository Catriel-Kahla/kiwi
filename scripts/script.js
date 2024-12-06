document.getElementById("butGenerate").addEventListener("click", function () {
  (async () => {
    // Generar las claves RSA
    const rsaKeys = await generateRSAKeys();

    // Exportar la clave pública (en formato base64)
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki", // Formato adecuado para clave pública
      rsaKeys.publicKey
    );
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
    document.getElementById("publicKey").value = publicKeyBase64; // Mostrar en el input

    // Exportar la clave privada (en formato base64)
    const exportedPrivateKey = await window.crypto.subtle.exportKey(
      "pkcs8", // Formato adecuado para clave privada
      rsaKeys.privateKey
    );
    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPrivateKey)));
    document.getElementById("privateKey").value = privateKeyBase64; // Mostrar en el input
  })();
});

document.getElementById("butCode").addEventListener("click", function () {
    const message = document.getElementById("message").value;
  
    // Función para importar la clave pública desde base64
    const importPublicKey = async (base64Key) => {
      const binaryKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
      const publicKey = await window.crypto.subtle.importKey(
        "spki", // Formato para la clave pública
        binaryKey.buffer,
        {
          name: "RSA-OAEP",
          hash: { name: "SHA-256" }
        },
        false,
        ["encrypt"]
      );
      return publicKey;
    };
  
    (async () => {
      // Obtener la clave pública de base64
      const publicKey = await importPublicKey(document.getElementById("publicKey").value);
  
      // Cifrar el mensaje con la clave pública RSA
      const encryptedMessage = await encryptMessageWithRSA(publicKey, message);
  
      // Mostrar el mensaje cifrado en base64 en el campo de salida
      document.getElementById("txtOutputCode").value = encryptedMessage;
    })();
    // Función para cifrar el mensaje
    const encryptMessageWithRSA = async (publicKey, message) => {
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
  
    const encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      encodedMessage
    );
  
    // Convertir el mensaje cifrado a base64 para mostrarlo
    return btoa(String.fromCharCode(...new Uint8Array(encryptedMessage)));
    };
});

document.getElementById("butDecode").addEventListener("click", async function () {
  const encryptedMessageBase64 = document.getElementById("code").value;
  const privateKeyBase64 = document.getElementById("privateKey").value;

  const privateKey = await importPrivateKey(privateKeyBase64);
  const encryptedMessage = Uint8Array.from(atob(encryptedMessageBase64), c => c.charCodeAt(0)).buffer;

  const decryptedMessage = await decryptMessageWithRSA(privateKey, encryptedMessage);
  document.getElementById("txtOutputMessage").value = decryptedMessage;
});

document.getElementById("butCodeCopy").addEventListener("click", function () {
  navigator.clipboard.writeText(document.getElementById("txtOutputCode").value);
});

document.getElementById("butDecodeClear").addEventListener("click", function () {
  document.getElementById("code").value = "";
  document.getElementById("txtOutputMessage").value = "";
});

