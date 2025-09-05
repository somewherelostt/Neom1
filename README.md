# NEOM - Nitrolite Web3 Social App

A Next.js-based Web3 social media application featuring Nitrolite state channel integration for real-time messaging and automatic wallet authentication.

## Features

### ✅ Completed (Following Official Nitrolite Patterns)

- **Chapter 1: Wallet Connection**
  - MetaMask integration with viem library
  - Proper disconnect functionality with permission revocation
  - Real-time connection status updates

- **Chapter 2: WebSocket Connection & Authentication**
  - Nitrolite-compatible WebSocket service
  - Session authentication using wallet signatures
  - Real-time connection status indicators
  - JSON-RPC 2.0 protocol implementation

- **Chapter 3: Automatic & Secure Session Authentication** ⭐ NEW
  - Automatic authentication flow triggered when wallet connects
  - EIP-712 structured data for transparent, secure signatures
  - Challenge-response mechanism preventing replay attacks
  - Session key generation and localStorage persistence
  - JWT token support for instant re-authentication
  - No manual "Authenticate" button needed - seamless UX

### 🎯 Enhanced User Experience
- **Automatic Flow**: Authentication starts immediately when wallet connects
- **Security**: EIP-712 + challenge-response prevents attacks
- **Transparency**: Users see exactly what they're signing
- **Efficiency**: JWT enables instant future re-authentication
- **Modern UI**: Real-time progress indicators and status updates

## Tech Stack

- **Frontend**: Next.js 14.2.16, TypeScript, Tailwind CSS
- **Web3**: viem 2.37.3, @erc7824/nitrolite
- **Authentication**: EIP-712, Session keys, JWT tokens
- **UI Components**: Radix UI, shadcn/ui
- **Real-time**: WebSocket API with JSON-RPC

## Project Structure

```
├── lib/
│   ├── wallet.ts              # Enhanced wallet connection w/ EIP-712 support
│   ├── nitrolite-websocket.ts # Updated WebSocket service (Chapter 3)
│   ├── authentication.ts      # NEW: Automatic auth service (Chapter 3)
│   └── utils.ts               # NEW: Session keys & JWT helpers (Chapter 3)
├── components/
│   ├── wallet-connect.tsx     # Wallet connection component
│   ├── websocket-status.tsx   # WebSocket status indicator
│   ├── auto-auth.tsx          # NEW: Automatic authentication UI (Chapter 3)
│   └── ui/                    # shadcn/ui components
└── app/
    ├── page.tsx               # Updated with automatic auth integration
    ├── layout.tsx             # Root layout
    └── globals.css            # Global styles
```

## Configuration

### Environment Variables

Create `.env.local` file:

```bash
# Nitrolite Configuration
NEXT_PUBLIC_NITROLITE_WS_URL=wss://clearnet.yellow.com/ws
NEXT_PUBLIC_NITROLITE_API_URL=http://localhost:8080

# Application Configuration
NEXT_PUBLIC_APP_NAME=NEOM
NEXT_PUBLIC_TIP_AMOUNT=1
```

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   pnpm dev
   ```

3. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Wallet Connection
1. Click "Connect Wallet" button
2. Approve MetaMask connection request
3. Wallet address will be displayed when connected

### Nitrolite Authentication
1. Ensure wallet is connected
2. Click "Authenticate Session" button
3. Sign the authentication message in MetaMask
4. Session will be authenticated with Nitrolite RPC

### Real-time Features
- WebSocket connection status is shown with colored indicators
- Authentication status updates in real-time
- All communications follow Nitrolite JSON-RPC protocol

## Implementation Details

### Nitrolite WebSocket Service

The `NitroliteWebSocketService` class provides:

- **Connection Management**: Auto-connect/disconnect with retry logic
- **Authentication**: Session-based auth using wallet signatures
- **Message Handling**: JSON-RPC 2.0 request/response processing
- **Status Updates**: Real-time connection and auth status

### Session Authentication Flow

1. **Message Creation**: Generate timestamped welcome message
2. **Signature**: User signs message with wallet
3. **RPC Request**: Send `session_auth` method with signature
4. **Response Handling**: Process authentication result
5. **Status Update**: Update UI with authentication status

### Key Components

- `WalletConnect`: Manages wallet connection state
- `NitroliteAuth`: Handles Nitrolite session authentication
- `WebSocketStatus`: Shows real-time connection status

## Development Notes

### Following Nitrolite Patterns

This implementation follows the official [erc7824/nitrolite-example](https://github.com/erc7824/nitrolite-example) patterns:

- ✅ JSON-RPC 2.0 protocol for WebSocket communication
- ✅ `session_auth` method for authentication
- ✅ Proper message signing with wallet client
- ✅ Response handling with promise-based architecture
- ✅ Status management for connection states

### Next Steps

The application is ready for additional Nitrolite features:
- State channel creation
- Real-time messaging
- Payment channels
- Multi-party interactions

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check `NEXT_PUBLIC_NITROLITE_WS_URL` environment variable
   - Ensure Nitrolite RPC server is running
   - Verify network connectivity

2. **Authentication Fails**
   - Ensure wallet is properly connected
   - Check that user signs the message in MetaMask
   - Verify WebSocket connection is established first

3. **Import Errors**
   - Ensure all dependencies are installed: `pnpm install`
   - Check that file paths are correct
   - Verify TypeScript configuration

## License

MIT License - Feel free to use and modify for your projects.
