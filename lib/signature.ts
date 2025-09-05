import { verifyMessage } from "viem";
import { type Address } from "viem";

export interface SignatureVerificationResult {
  isValid: boolean;
  recoveredAddress?: Address;
  error?: string;
}

export interface AuthMessage {
  address: string;
  timestamp: number;
  challenge: string;
  domain: string;
}

/**
 * Creates a standardized message for signing
 */
export function createAuthMessage(
  address: string,
  challenge: string,
  timestamp: number
): string {
  const domain = process.env.NEXT_PUBLIC_APP_NAME || "NEOM";

  return `Welcome to ${domain}!

Please sign this message to authenticate your wallet.

Address: ${address}
Challenge: ${challenge}
Timestamp: ${timestamp}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

/**
 * Verifies a signature against the expected message and address
 */
export async function verifyAuthSignature(
  signature: string,
  message: string,
  expectedAddress: string
): Promise<SignatureVerificationResult> {
  try {
    // Verify the message signature
    const isValid = await verifyMessage({
      address: expectedAddress as Address,
      message,
      signature: signature as `0x${string}`,
    });

    if (isValid) {
      return {
        isValid: true,
        recoveredAddress: expectedAddress as Address,
      };
    } else {
      return {
        isValid: false,
        error: "Signature verification failed",
      };
    }
  } catch (error: any) {
    console.error("Signature verification error:", error);
    return {
      isValid: false,
      error: error.message || "Unknown verification error",
    };
  }
}

/**
 * Validates that an auth response is properly formatted and recent
 */
export function validateAuthResponse(response: any): {
  isValid: boolean;
  error?: string;
} {
  // Check required fields
  if (!response.result) {
    return {
      isValid: false,
      error: "Missing result in response",
    };
  }

  const { signature, message, address } = response.result;

  if (!signature || !message || !address) {
    return {
      isValid: false,
      error: "Missing required fields in auth response",
    };
  }

  // Validate signature format (should start with 0x and be 132 characters)
  if (!signature.startsWith("0x") || signature.length !== 132) {
    return {
      isValid: false,
      error: "Invalid signature format",
    };
  }

  // Validate address format (should start with 0x and be 42 characters)
  if (!address.startsWith("0x") || address.length !== 42) {
    return {
      isValid: false,
      error: "Invalid address format",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Complete authorization flow: send request, receive response, and verify
 */
export async function processAuthResponse(
  response: any,
  expectedAddress: string
): Promise<{
  isAuthenticated: boolean;
  error?: string;
  details?: SignatureVerificationResult;
}> {
  // First validate the response format
  const validation = validateAuthResponse(response);
  if (!validation.isValid) {
    return {
      isAuthenticated: false,
      error: validation.error,
    };
  }

  const { signature, message, address } = response.result;

  // Verify the address matches expectation
  if (address.toLowerCase() !== expectedAddress.toLowerCase()) {
    return {
      isAuthenticated: false,
      error: "Address mismatch in auth response",
    };
  }

  // Verify the signature
  const verificationResult = await verifyAuthSignature(
    signature,
    message,
    expectedAddress
  );

  return {
    isAuthenticated: verificationResult.isValid,
    error: verificationResult.error,
    details: verificationResult,
  };
}
