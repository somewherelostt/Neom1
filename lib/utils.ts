import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { type Address } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// CHAPTER 3: Session Key Management
export interface SessionKey {
  privateKey: `0x${string}`;
  address: Address;
}

// Session key management
const SESSION_KEY_STORAGE = "neom_session_key";

export const generateSessionKey = (): SessionKey => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { privateKey, address: account.address };
};

export const getStoredSessionKey = (): SessionKey | null => {
  try {
    if (typeof window === "undefined") return null; // SSR safety
    const stored = localStorage.getItem(SESSION_KEY_STORAGE);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed.privateKey || !parsed.address) return null;

    return parsed as SessionKey;
  } catch {
    return null;
  }
};

export const storeSessionKey = (sessionKey: SessionKey): void => {
  try {
    if (typeof window === "undefined") return; // SSR safety
    localStorage.setItem(SESSION_KEY_STORAGE, JSON.stringify(sessionKey));
  } catch {
    // Storage failed - continue without caching
  }
};

export const removeSessionKey = (): void => {
  try {
    if (typeof window === "undefined") return; // SSR safety
    localStorage.removeItem(SESSION_KEY_STORAGE);
  } catch {
    // Removal failed - not critical
  }
};

// JWT helpers
const JWT_KEY = "neom_jwt_token";

export const getStoredJWT = (): string | null => {
  try {
    if (typeof window === "undefined") return null; // SSR safety
    return localStorage.getItem(JWT_KEY);
  } catch {
    return null;
  }
};

export const storeJWT = (token: string): void => {
  try {
    if (typeof window === "undefined") return; // SSR safety
    localStorage.setItem(JWT_KEY, token);
  } catch {}
};

export const removeJWT = (): void => {
  try {
    if (typeof window === "undefined") return; // SSR safety
    localStorage.removeItem(JWT_KEY);
  } catch {}
};
