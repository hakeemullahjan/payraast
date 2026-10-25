# PayRaast

**Get paid globally. Keep your money in stable value.**

PayRaast is a non-custodial invoicing platform built for Pakistani freelancers to request international payments in **USDC on Stellar Testnet**, receive payments directly to their Stellar wallet, and view an independently verified payment receipt.

> **Note:** Stellar Testnet only. No real money, PKR cash-out, banking rails, or custody are part of this MVP. Testnet tokens have zero monetary value.

---

## Architecture

PayRaast is organized as a lightweight TypeScript monorepo using npm workspaces:

```
apps/
  web/            React 18 + Vite + Tailwind CSS + Lucide React + Freighter Wallet API
  api/            Node.js 22 + Express + Stellar SDK + SQLite (built-in node:sqlite)
packages/
  shared/         Shared TypeScript contracts, Zod schemas & Stellar Testnet configurations
```

---

## Prerequisites

- **Node.js**: `v22.13.0` or newer (utilizes native `node:sqlite`)
- **npm**: `v10` or newer
- **Stellar Wallet** (for demo testing): [Freighter browser extension](https://www.freighter.app/) set to **Testnet**

---

## Quickstart

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example environment file:

```bash
cp .env.example .env
```

The defaults in `.env` are pre-configured for Stellar Testnet and official Circle Testnet USDC:
* **Network**: `TESTNET`
* **Network Passphrase**: `Test SDF Network ; September 2015`
* **Horizon URL**: `https://horizon-testnet.stellar.org`
* **Stellar Asset Code**: `USDC`
* **Stellar Asset Issuer**: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`

### 3. Start development servers

In **Terminal 1** (API):
```bash
npm run dev:api
```
*Health check:* http://localhost:4000/api/health

In **Terminal 2** (Web):
```bash
npm run dev:web
```
*Web application:* http://localhost:5173

---

## Testnet Wallet Setup for Demo

To test paying an invoice using Freighter on Stellar Testnet:

1. **Install Freighter**: Install the [Freighter browser extension](https://www.freighter.app/).
2. **Switch to Testnet**: Open Freighter Settings $\rightarrow$ Network $\rightarrow$ select **Testnet**.
3. **Fund with Testnet XLM**: Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) or use Stellar Friendbot to fund your address with free testnet XLM.
4. **Establish USDC Trustline**:
   * Asset Code: `USDC`
   * Issuer: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
5. **Get Testnet USDC**: Request testnet USDC from the Circle Testnet Faucet or Stellar Testnet faucet.

*(Alternatively, you can also test using Stellar Laboratory or any external wallet by submitting the 64-character transaction hash on the payment page for server verification).*

---

## Step-by-Step Demo Flow

1. **Create Invoice**:
   * Navigate to http://localhost:5173
   * Click **New invoice** (`/invoices/new`).
   * Enter client name, project title, amount (e.g. `25.00`), and your recipient Stellar address (`G...`).
   * Click **Create invoice**.
2. **View & Share**:
   * The freelancer is redirected to `/invoices/:id` with a QR code and shareable public link (`/pay/:id`).
   * Copy the public payment link or open it directly.
3. **Pay via Freighter Wallet**:
   * Open the link in a browser with Freighter.
   * Click **Connect Freighter Wallet** and approve the connection.
   * Click **Pay 25.00 USDC**. Freighter pops up displaying the payment destination, fee, and amount.
   * Click **Approve**.
4. **Server-Side Verification**:
   * The signed transaction is submitted to Stellar Testnet Horizon.
   * The PayRaast API independently verifies the payment operation against Stellar Horizon (validating recipient address, asset code, Circle issuer, and exact Stroop amount).
   * Replay protection ensures the transaction hash cannot be reused.
5. **Verified Receipt**:
   * Once verified, the invoice transitions to **Paid**.
   * A verified receipt is displayed with transaction details, ledger timestamp, and a direct link to **Stellar Expert Testnet Explorer**.
