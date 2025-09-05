import { type Address, type WalletClient } from "viem";

export type WsStatus =
  | "Connecting"
  | "Connected"
  | "Disconnected"
  | "Authenticated";

type StatusListener = (status: WsStatus) => void;
type MessageListener = (data: any) => void;

interface SessionAuthRequest {
  method: "session_auth";
  params: {
    address: string;
    signature: string;
    message: string;
  };
}

interface SessionAuthResponse {
  result?: {
    authenticated: boolean;
    sessionId: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

class NitroliteWebSocketService {
  private socket: WebSocket | null = null;
  private status: WsStatus = "Disconnected";
  private statusListeners: Set<StatusListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();
  private messageQueue: string[] = [];
  private requestId = 1;
  private pendingRequests: Map<
    string,
    { resolve: Function; reject: Function }
  > = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  public connect() {
    if (this.socket && this.socket.readyState < 2) return;

    // For Next.js, we'll use process.env.NEXT_PUBLIC_ prefix
    const wsUrl =
      process.env.NEXT_PUBLIC_NITROLITE_WS_URL || "ws://localhost:8080";

    console.log(`🔗 Attempting to connect to: ${wsUrl}`);
    this.updateStatus("Connecting");

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("✅ WebSocket Connected to Nitrolite RPC");
        this.updateStatus("Connected");
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        this.messageQueue.forEach((msg) => this.socket?.send(msg));
        this.messageQueue = [];
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📥 WebSocket message received:", data);

          // Handle pending requests
          if (data.id && this.pendingRequests.has(data.id)) {
            const { resolve } = this.pendingRequests.get(data.id)!;
            this.pendingRequests.delete(data.id);
            resolve(data);
          }

          // Handle session auth responses
          if (data.result && data.result.authenticated === true) {
            this.updateStatus("Authenticated");
            console.log("🔐 Session authenticated successfully");
          }

          // Notify general message listeners
          this.messageListeners.forEach((listener) => listener(data));
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        console.log(
          `🔌 WebSocket Disconnected (Code: ${event.code}, Reason: ${event.reason})`
        );
        this.updateStatus("Disconnected");
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error("💥 WebSocket Error:", error);
        this.updateStatus("Disconnected");
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      this.updateStatus("Disconnected");
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `❌ Max reconnection attempts (${this.maxReconnectAttempts}) exceeded`
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`
    );

    setTimeout(() => {
      if (this.status === "Disconnected") {
        this.connect();
      }
    }, delay);
  }

  public disconnect() {
    console.log("🔌 Manually disconnecting WebSocket...");
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnection
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.updateStatus("Disconnected");
  }

  public forceReconnect() {
    console.log("🔄 Force reconnecting WebSocket...");
    this.reconnectAttempts = 0; // Reset reconnect attempts
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  public send(method: string, params: any): Promise<any>;
  public send(payload: string): void;
  public send(methodOrPayload: string, params?: any): Promise<any> | void {
    // CHAPTER 3: Support for pre-formatted JSON-RPC strings
    if (params === undefined) {
      // This is a pre-formatted payload string
      const payload = methodOrPayload;
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(payload);
      } else {
        this.messageQueue.push(payload);
      }
      return;
    }

    // Original method with params (returns Promise)
    const requestId = `${this.requestId++}`;
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id: requestId,
      method: methodOrPayload,
      params,
    });

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request timeout for method: ${methodOrPayload}`));
        }
      }, 30000);

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(payload);
      } else {
        this.messageQueue.push(payload);
      }
    });
  }

  /**
   * Authenticate session using wallet signature
   * Following the Nitrolite example pattern
   */
  public async authenticateSession(
    walletClient: WalletClient,
    address: Address
  ): Promise<SessionAuthResponse> {
    try {
      // Create the authentication message
      const message = `Welcome to NEOM!\n\nPlease sign this message to authenticate your session.\n\nAddress: ${address}\nTimestamp: ${Date.now()}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;

      // Sign the message using the wallet
      const signature = await walletClient.signMessage({
        message,
        account: address,
      });

      console.log("Message signed, sending session auth request...");

      // Send authentication request
      const response = await this.send("session_auth", {
        address,
        signature,
        message,
      });

      console.log("Session auth response:", response);
      return response;
    } catch (error) {
      console.error("Session authentication failed:", error);
      throw error;
    }
  }

  private updateStatus(newStatus: WsStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(this.status));
  }

  public setStatus(newStatus: WsStatus) {
    this.updateStatus(newStatus);
  }

  public getStatus(): WsStatus {
    return this.status;
  }

  public addStatusListener(listener: StatusListener) {
    this.statusListeners.add(listener);
    // Immediately call with current status
    listener(this.status);
  }

  public removeStatusListener(listener: StatusListener) {
    this.statusListeners.delete(listener);
  }

  public addMessageListener(listener: MessageListener) {
    this.messageListeners.add(listener);
  }

  public removeMessageListener(listener: MessageListener) {
    this.messageListeners.delete(listener);
  }
}

export const nitroliteWebSocketService = new NitroliteWebSocketService();
