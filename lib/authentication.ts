import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  parseAnyRPCResponse,
  RPCMethod,
  type AuthChallengeResponse,
  type AuthRequestParams,
} from "@erc7824/nitrolite";
import { type Address, type WalletClient } from "viem";
import {
  generateSessionKey,
  getStoredSessionKey,
  storeSessionKey,
  removeSessionKey,
  storeJWT,
  removeJWT,
  type SessionKey,
} from "./utils";
import { nitroliteWebSocketService } from "./nitrolite-websocket";

// CHAPTER 3: EIP-712 domain for authentication
const getAuthDomain = () => ({
  name: "NEOM",
});

// CHAPTER 3: Authentication constants
const AUTH_SCOPE = "neom-app.com";
const APP_NAME = "NEOM";
const SESSION_DURATION = 3600; // 1 hour

export interface AuthState {
  sessionKey: SessionKey | null;
  isAuthenticated: boolean;
  isAuthAttempted: boolean;
  sessionExpireTimestamp: string;
}

type AuthStateListener = (state: AuthState) => void;

class AuthenticationService {
  private authState: AuthState = {
    sessionKey: null,
    isAuthenticated: false,
    isAuthAttempted: false,
    sessionExpireTimestamp: "",
  };

  private listeners: Set<AuthStateListener> = new Set();
  private walletClient: WalletClient | null = null;
  private account: Address | null = null;

  constructor() {
    // Initialize session key on startup
    this.initializeSessionKey();

    // Listen to WebSocket messages
    nitroliteWebSocketService.addMessageListener(this.handleMessage.bind(this));
  }

  private initializeSessionKey() {
    if (typeof window === "undefined") return; // SSR safety

    const existingSessionKey = getStoredSessionKey();
    if (existingSessionKey) {
      this.updateAuthState({ sessionKey: existingSessionKey });
    } else {
      const newSessionKey = generateSessionKey();
      storeSessionKey(newSessionKey);
      this.updateAuthState({ sessionKey: newSessionKey });
    }
  }

  public setWalletData(walletClient: WalletClient, account: Address) {
    this.walletClient = walletClient;
    this.account = account;

    // Trigger auto-authentication if conditions are met
    this.checkAndTriggerAuth();
  }

  public clearWalletData() {
    this.walletClient = null;
    this.account = null;
    this.updateAuthState({
      isAuthenticated: false,
      isAuthAttempted: false,
      sessionExpireTimestamp: "",
    });
  }

  private checkAndTriggerAuth() {
    const wsStatus = nitroliteWebSocketService.getStatus();

    if (
      this.account &&
      this.authState.sessionKey &&
      wsStatus === "Connected" &&
      !this.authState.isAuthenticated &&
      !this.authState.isAuthAttempted
    ) {
      this.startAuthentication();
    }
  }

  private async startAuthentication() {
    if (!this.account || !this.authState.sessionKey) return;

    this.updateAuthState({ isAuthAttempted: true });

    // Generate fresh timestamp for this auth attempt
    const expireTimestamp = String(
      Math.floor(Date.now() / 1000) + SESSION_DURATION
    );
    this.updateAuthState({ sessionExpireTimestamp: expireTimestamp });

    const authParams: AuthRequestParams = {
      address: this.account,
      session_key: this.authState.sessionKey.address,
      app_name: APP_NAME,
      expire: expireTimestamp,
      scope: AUTH_SCOPE,
      application: this.account,
      allowances: [],
    };

    try {
      const payload = await createAuthRequestMessage(authParams);
      nitroliteWebSocketService.send(payload);
    } catch (error) {
      console.error("Failed to create auth request:", error);
      this.updateAuthState({ isAuthAttempted: false });
    }
  }

  private async handleMessage(data: any) {
    try {
      const response = parseAnyRPCResponse(JSON.stringify(data));

      // Handle auth challenge
      if (
        response.method === RPCMethod.AuthChallenge &&
        this.walletClient &&
        this.authState.sessionKey &&
        this.account &&
        this.authState.sessionExpireTimestamp
      ) {
        await this.handleAuthChallenge(response as AuthChallengeResponse);
      }

      // Handle auth success
      if (
        response.method === RPCMethod.AuthVerify &&
        response.params?.success
      ) {
        this.updateAuthState({ isAuthenticated: true });
        if (response.params.jwtToken) {
          storeJWT(response.params.jwtToken);
        }
        nitroliteWebSocketService.setStatus("Authenticated");
      }

      // Handle errors
      if (response.method === RPCMethod.Error) {
        removeJWT();
        // Clear session key on auth failure to regenerate next time
        removeSessionKey();
        this.updateAuthState({
          isAuthAttempted: false,
          sessionKey: null,
        });

        // Generate new session key
        const newSessionKey = generateSessionKey();
        storeSessionKey(newSessionKey);
        this.updateAuthState({ sessionKey: newSessionKey });

        console.error(`Authentication failed: ${response.params?.error}`);
      }
    } catch (error) {
      console.error("Error handling authentication message:", error);
    }
  }

  private async handleAuthChallenge(challengeResponse: AuthChallengeResponse) {
    if (!this.walletClient || !this.authState.sessionKey || !this.account)
      return;

    const authParams = {
      scope: AUTH_SCOPE,
      application: this.walletClient.account?.address as `0x${string}`,
      participant: this.authState.sessionKey.address as `0x${string}`,
      expire: this.authState.sessionExpireTimestamp,
      allowances: [],
    };

    const eip712Signer = createEIP712AuthMessageSigner(
      this.walletClient,
      authParams,
      getAuthDomain()
    );

    try {
      const authVerifyPayload = await createAuthVerifyMessage(
        eip712Signer,
        challengeResponse
      );
      nitroliteWebSocketService.send(authVerifyPayload);
    } catch (error) {
      console.error("Signature rejected:", error);
      this.updateAuthState({ isAuthAttempted: false });
      throw error; // Re-throw to handle in UI
    }
  }

  private updateAuthState(updates: Partial<AuthState>) {
    this.authState = { ...this.authState, ...updates };
    this.listeners.forEach((listener) => listener(this.authState));
  }

  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  public addListener(listener: AuthStateListener) {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.authState);
  }

  public removeListener(listener: AuthStateListener) {
    this.listeners.delete(listener);
  }

  public onWebSocketStatusChange(status: string) {
    if (status === "Connected") {
      this.checkAndTriggerAuth();
    } else if (status === "Disconnected") {
      this.updateAuthState({
        isAuthenticated: false,
        isAuthAttempted: false,
      });
    }
  }

  public reset() {
    removeJWT();
    removeSessionKey();
    this.updateAuthState({
      sessionKey: null,
      isAuthenticated: false,
      isAuthAttempted: false,
      sessionExpireTimestamp: "",
    });
    this.initializeSessionKey();
  }
}

export const authenticationService = new AuthenticationService();
