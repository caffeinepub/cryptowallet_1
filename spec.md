# CryptoWallet

## Current State
The project scaffolding exists but the app is incomplete: no App.tsx, no Motoko backend source, and no backend.d.ts bindings. The frontend references `./backend` and `./App` which are missing, causing build failures.

## Requested Changes (Diff)

### Add
- Motoko backend: user accounts, wallet balances per asset (BTC, ETH, ICP, USDT), transaction history (send/receive), and account management
- App.tsx with full crypto wallet UI: dashboard with balance overview, asset list, transaction history, send/receive modals
- Authorization so each user sees only their own data

### Modify
- Nothing (greenfield)

### Remove
- Nothing

## Implementation Plan
1. Select `authorization` component for per-user data isolation
2. Generate Motoko backend with wallet state, transactions, and asset balances
3. Build React frontend with dark fintech design: balance card, asset list, transaction history, send/receive actions
