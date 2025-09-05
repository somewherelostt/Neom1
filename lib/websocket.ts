export type WsStatus =
  | "Connecting"
  | "Connected"
  | "Disconnected"
  | "Authorized";

type StatusListener = (status: WsStatus) => void;
type MessageListener = (data: any) => void;
type AuthResponseListener = (response: AuthResponse) => void;

interface AuthRequest {
  id: string;
  method: "auth_request";
  params: {
    address: string;
    timestamp: number;
    challenge: string;
  };
}

interface AuthResponse {
  id: string;
  result?: {
    signature: string;
    message: string;
    address: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private status: WsStatus = "Disconnected";
  private statusListeners: Set<StatusListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();
  private authResponseListeners: Set<AuthResponseListener> = new Set();
  private messageQueue: string[] = [];
  private requestId = 1;
  private pendingAuthRequests: Map<
    string,
    { resolve: Function; reject: Function }
  > = new Map();

  public connect() {
    if (this.socket && this.socket.readyState < 2) return;

    // For Next.js, we'll use process.env.NEXT_PUBLIC_ prefix
    const wsUrl = process.env.NEXT_PUBLIC_NITROLITE_WS_URL;
    if (!wsUrl) {
      console.error("NEXT_PUBLIC_NITROLITE_WS_URL is not set");
      this.updateStatus("Disconnected");
      return;
    }

    this.updateStatus("Connecting");
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket Connected");
      this.updateStatus("Connected");
      this.messageQueue.forEach((msg) => this.socket?.send(msg));
      this.messageQueue = [];
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle auth responses specifically
        if (data.id && this.pendingAuthRequests.has(data.id)) {
          const { resolve } = this.pendingAuthRequests.get(data.id)!;
          this.pendingAuthRequests.delete(data.id);

          // Notify auth response listeners
          this.authResponseListeners.forEach((listener) =>
            listener(data as AuthResponse)
          );

          // Resolve the promise
          resolve(data as AuthResponse);

          // Update status to authorized if successful
          if (data.result && !data.error) {
            this.updateStatus("Authorized");
          }
        }

        // Notify general message listeners
        this.messageListeners.forEach((listener) => listener(data));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket Disconnected");
      this.updateStatus("Disconnected");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      this.updateStatus("Disconnected");
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.updateStatus("Disconnected");
  }

  public send(method: string, params: any) {
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id: this.requestId++,
      method,
      params,
    });

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
    } else {
      this.messageQueue.push(payload);
    }
  }

  public async sendAuthRequest(address: string): Promise<AuthResponse> {
    const requestId = `auth_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const challenge = this.generateChallenge();

    const authRequest: AuthRequest = {
      id: requestId,
      method: "auth_request",
      params: {
        address,
        timestamp: Date.now(),
        challenge,
      },
    };

    return new Promise((resolve, reject) => {
      // Store the promise handlers
      this.pendingAuthRequests.set(requestId, { resolve, reject });

      // Set a timeout for the request
      setTimeout(() => {
        if (this.pendingAuthRequests.has(requestId)) {
          this.pendingAuthRequests.delete(requestId);
          reject(new Error("Authorization request timeout"));
        }
      }, 30000); // 30 second timeout

      // Send the request
      const payload = JSON.stringify({
        jsonrpc: "2.0",
        id: requestId,
        method: "auth_request",
        params: authRequest.params,
      });

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(payload);
        console.log("Authorization request sent:", authRequest);
      } else {
        this.messageQueue.push(payload);
      }
    });
  }

  private generateChallenge(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 16);
    return `${timestamp}_${random}`;
  }

  private updateStatus(newStatus: WsStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(this.status));
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

  public addAuthResponseListener(listener: AuthResponseListener) {
    this.authResponseListeners.add(listener);
  }

  public removeAuthResponseListener(listener: AuthResponseListener) {
    this.authResponseListeners.delete(listener);
  }
}

export const webSocketService = new WebSocketService();
