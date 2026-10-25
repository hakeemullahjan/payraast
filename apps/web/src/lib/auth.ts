import { Keypair } from "@stellar/stellar-sdk";

export interface UserSession {
  publicKey: string;
  authMethod: "pincode" | "wallet";
  encryptedSecret?: string;
  name?: string;
  email?: string;
  createdAt: string;
}

const STORAGE_KEY = "payraast_auth_session";

// Simple reversible obfuscation for demo keypair testnet storage with user's 6-digit PIN
function encryptSecret(secret: string, pin: string): string {
  let result = "";
  for (let i = 0; i < secret.length; i++) {
    const charCode = secret.charCodeAt(i) ^ pin.charCodeAt(i % pin.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

function decryptSecret(encrypted: string, pin: string): string {
  try {
    const decoded = atob(encrypted);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ pin.charCodeAt(i % pin.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    throw new Error("Invalid decryption");
  }
}

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("payraast:auth_changed"));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("payraast:auth_changed"));
}

export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return response.ok;
  } catch (err) {
    console.warn("Friendbot funding notice:", err);
    return false;
  }
}

export async function registerWithPincode({
  publicKey,
  secretKey,
  pincode,
  name,
  email,
}: {
  publicKey: string;
  secretKey: string;
  pincode: string;
  name?: string;
  email?: string;
}): Promise<UserSession> {
  const encryptedSecret = encryptSecret(secretKey, pincode);
  const session: UserSession = {
    publicKey,
    authMethod: "pincode",
    encryptedSecret,
    name: name || "Freelancer",
    email: email || "",
    createdAt: new Date().toISOString(),
  };
  saveSession(session);
  // Auto-fund testnet account with friendbot in background
  void fundWithFriendbot(publicKey);
  return session;
}

export function loginWithPincode(pincode: string): UserSession {
  const session = getSession();
  if (!session || !session.encryptedSecret) {
    throw new Error("No registered account found. Please sign up first.");
  }
  const secret = decryptSecret(session.encryptedSecret, pincode);
  // Verify decrypted secret matches public key
  try {
    const kp = Keypair.fromSecret(secret);
    if (kp.publicKey() !== session.publicKey) {
      throw new Error("Incorrect pincode");
    }
  } catch {
    throw new Error("Incorrect 6-digit pincode.");
  }
  saveSession(session);
  return session;
}

export function loginWithWallet(publicKey: string, name?: string): UserSession {
  const session: UserSession = {
    publicKey,
    authMethod: "wallet",
    name: name || "Freighter User",
    createdAt: new Date().toISOString(),
  };
  saveSession(session);
  return session;
}

export function generateNewKeypair(): { publicKey: string; secretKey: string } {
  const kp = Keypair.random();
  return {
    publicKey: kp.publicKey(),
    secretKey: kp.secret(),
  };
}
