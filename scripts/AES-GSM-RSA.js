let insData = "GATO";
let sData;
let sKey;
let sAESK;
let sRSAK;


async function generateRSAKeys() {
    const rsaKeys = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,  // Tamaño de la clave RSA
            publicExponent: new Uint8Array([1, 0, 1]), // Exponente público
            hash: "SHA-256", // Algoritmo de hash
        },
        true, // Claves exportables
        ["encrypt", "decrypt"] // Métodos permitidos
    );
    return rsaKeys;
}

async function encryptMessageWithRSA(publicKey, message) {
    // Convertir el mensaje a un ArrayBuffer
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);

    // Cifrar el mensaje con la clave pública RSA
    const encryptedMessage = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey, // Clave pública RSA
        encodedMessage // Mensaje cifrado
    );

    return encryptedMessage;
}

async function decryptMessageWithRSA(privateKey, encryptedMessage) {
    // Descifrar el mensaje con la clave privada RSA
    const decryptedMessage = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        privateKey, // Clave privada RSA
        encryptedMessage // Mensaje cifrado
    );

    // Convertir el ArrayBuffer descifrado de nuevo a texto
    const decoder = new TextDecoder();
    return decoder.decode(decryptedMessage);
}

function decodeBase64ToArrayBuffer(base64) {
    const binaryString = atob(base64);  // Decodificar la cadena base64 a una cadena binaria
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;  // Retornar un ArrayBuffer
}

async function importPublicKeyFromBase64(base64) {
    const arrayBuffer = decodeBase64ToArrayBuffer(base64);

    // Importar la clave pública (esto es para claves RSA)
    const publicKey = await window.crypto.subtle.importKey(
        "spki",               // Formato para la clave pública
        arrayBuffer,          // El ArrayBuffer de la clave decodificada
        {
            name: "RSA-OAEP",  // El algoritmo que estamos usando
            hash: "SHA-256",    // El tipo de hash (SHA-256 en este caso)
        },
        true,                  // Si la clave es exportable o no
        ["encrypt"]            // Las operaciones que la clave puede realizar (en este caso, cifrar)
    );

    return publicKey;
}

async function importPrivateKey(base64Key) {
    const binaryKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
        "pkcs8", 
        binaryKey.buffer, 
        { name: "RSA-OAEP", hash: "SHA-256" }, 
        false, 
        ["decrypt"]
    );
}