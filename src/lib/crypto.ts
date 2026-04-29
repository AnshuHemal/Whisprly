/**
 * AES-GCM 256-bit encryption/decryption utilities.
 * Uses the Web Crypto API — compatible with Node.js 18+ and modern browsers.
 * All transcript data is encrypted before being stored in the database.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96-bit IV recommended for AES-GCM

/**
 * Derives a CryptoKey from a raw base64-encoded key string.
 */
async function deriveKey(rawKey: string): Promise<CryptoKey> {
  const keyBytes = Buffer.from(rawKey, "base64");
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plaintext string using AES-GCM.
 * Returns a base64-encoded string containing the IV prepended to the ciphertext.
 *
 * @param plaintext - The string to encrypt
 * @param rawKey - Base64-encoded 256-bit encryption key (from ENCRYPTION_KEY env var)
 */
export async function encrypt(plaintext: string, rawKey: string): Promise<string> {
  const key = await deriveKey(rawKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  // Prepend IV to ciphertext so we can extract it during decryption
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return Buffer.from(combined).toString("base64");
}

/**
 * Decrypts a base64-encoded AES-GCM ciphertext string.
 * Expects the IV to be prepended to the ciphertext (as produced by `encrypt`).
 *
 * @param encryptedData - Base64-encoded IV + ciphertext
 * @param rawKey - Base64-encoded 256-bit encryption key
 */
export async function decrypt(encryptedData: string, rawKey: string): Promise<string> {
  const key = await deriveKey(rawKey);
  const combined = Buffer.from(encryptedData, "base64");

  const iv = combined.subarray(0, IV_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Generates a new random 256-bit AES key, returned as a base64 string.
 * Use this to generate the ENCRYPTION_KEY environment variable.
 */
export async function generateKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  return Buffer.from(exported).toString("base64");
}
