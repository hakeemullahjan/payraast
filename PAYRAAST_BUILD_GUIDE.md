# PayRaast --- Build Guide, Recovery Instructions & Progress Tracker

> **Purpose:** This file is the single source of truth for any AI coding
> agent working on PayRaast. If the agent loses context, gets restarted,
> changes model, or seems unsure what to do, it must read this file
> first, inspect the actual workspace, verify the current state, update
> this file, and continue from the next unfinished milestone.

## 1. Project snapshot

**Product:** PayRaast\
**Hackathon:** HackMeridian Genesis\
**Target:** A focused, demo-ready MVP for Pakistani freelancers to
request international stablecoin payments on Stellar.\
**Deadline noted by the user:** October 26, 2026, 12:00 Lisbon time.
Confirm with the user if the deadline has changed.

### MVP demo flow

1.  A freelancer creates an invoice with a title/description, amount,
    and supported asset.
2.  The app creates a shareable public invoice URL.
3.  A client opens that URL and connects a compatible Stellar wallet.
4.  The client reviews the invoice and explicitly signs the payment
    transaction in the wallet.
5.  The transaction is submitted to **Stellar Testnet**.
6.  The backend independently checks the transaction against Stellar
    Testnet and verifies the payment matches the invoice.
7.  The invoice changes to **Paid** only after successful verification.
8.  A receipt displays the amount, asset, transaction hash, and correct
    Stellar Testnet Explorer link.

**Out of scope:** PKR cash-out, bank payouts, mainnet payments, custody,
storing private keys, issuing a custom token, or claiming a payment
succeeded without independent verification.

## 2. Stack and implementation preferences

Use these unless the existing repository or the user explicitly requires
a change:

-   Frontend: React, TypeScript, Vite, Tailwind CSS, React Router.
-   Backend: Node.js, Express, TypeScript.
-   Database: SQLite for the MVP.
-   Validation: Zod where useful.
-   Icons: Lucide React where useful.
-   Blockchain: Stellar SDK and a wallet integration compatible with the
    chosen browser/client environment.
-   Network: **Stellar Testnet only**.
-   Package manager: use the one already established by the repository;
    otherwise use npm.
-   Keep the architecture small, readable, and easy to demo.

Do not invent asset identifiers or issuer addresses. Before implementing
a stablecoin transfer, verify the exact Testnet asset code and issuer
from an authoritative source or a reliable Testnet source. If a suitable
stablecoin asset cannot be confirmed, explain the blocker and ask the
user before choosing a test asset. Clearly label any non-USDC or demo
asset.

## 3. Non-negotiable safety and honesty rules

1.  Never store, log, transmit to the backend, or commit wallet secret
    keys, seed phrases, or private keys.
2.  Never fake a successful payment, hard-code a transaction hash as if
    it were real, or mark an invoice Paid based only on frontend state.
3.  Never claim a build, test, install, migration, or transaction
    succeeded unless there is actual confirming output.
4.  Do not use Stellar Mainnet for this MVP.
5.  Do not implement PKR cash-out or imply Testnet tokens have real
    monetary value.
6.  Validate invoice IDs, amounts, asset/network, transaction hashes,
    and API input. Prevent a transaction from being reused to pay
    multiple invoices.
7.  Verify transaction success and relevant payment operation details
    server-side against Stellar Testnet. Check recipient, asset/issuer,
    amount, transaction success, and replay/duplicate use. Do not rely
    on a client-provided "success" flag.
8.  Never expose secrets or put API keys in frontend code. Use
    environment variables for configuration and provide a safe
    `.env.example` without real secrets.
9.  Keep changes focused. Do not rewrite working areas without a reason.
10. If requirements conflict or a critical integration cannot be
    verified, stop and explain the exact issue instead of guessing.

## 4. Terminal and command policy

The user wants to run terminal commands themselves.

-   **Do not execute terminal commands**, including `npm install`,
    `npm run dev`, `npm run build`, tests, `npx`, migrations, shell
    scripts, Git commands, or system-modifying commands.
-   Do not use an integrated terminal or tool to bypass this rule.
-   When a command is necessary, provide:
    1.  The exact command, in a code block.
    2.  The directory in which the user should run it.
    3.  Why it is needed.
    4.  What successful output or behavior should look like.
    5.  What output the user should send back if it fails.
-   Then wait for the user to run it and report the result before
    claiming it passed.
-   You may inspect and edit project files through the coding agent's
    file-editing capabilities, subject to its permission settings.
-   If a tool or environment automatically runs a command, disclose that
    and do not imply the user ran it.
-   Do not use unrestricted/YOLO permission mode to get around this
    policy.

## 5. Required agent workflow

Whenever starting or resuming work:

1.  Read this entire `PAYRAAST_BUILD_GUIDE.md`.
2.  Inspect the actual workspace and list the important files that
    exist.
3.  Read the current app code, package manifests, environment examples,
    and this tracker. Do not trust old chat messages over the files.
4.  Compare actual files and behavior with the milestone checklist
    below.
5.  Verify status using **file inspection and available evidence**. If
    runtime verification requires commands, request the user to run
    them.
6.  Update the status table and checkboxes in this file based on
    evidence. Do not mark a task complete merely because code was
    generated.
7.  State briefly: **last verified milestone, evidence, next task,
    blockers, and any user command needed**.
8.  Implement only the next sensible milestone or a small, clearly
    defined portion of it.
9.  After editing, inspect the changed files for consistency and update
    this tracker.
10. Stop at a clear checkpoint and tell the user what changed and what
    remains.

### Progress updates

-   Work in small milestones rather than trying to generate the entire
    application in one enormous operation.
-   After each milestone, provide a concise update: what changed, files
    touched, what was verified, what remains, and the next step.
-   If an operation takes a long time and the interface supports
    progress updates, provide a useful update. Do not pretend to have
    sent a background update if the interface does not support it.
-   If interrupted, restart from this file and the actual workspace
    state---not from memory alone.

## 6. Milestones and verification checklist

**Starting status:** Project requirements and this plan are defined. No
implementation milestone should be considered complete until the
workspace has been inspected and evidence is available. Update the
status fields below as work progresses.

Status legend: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`,
`CODED — NOT RUN`, `VERIFIED`.

  ---------------------------------------------------------------------------------
  \#                Milestone          Initial status    Evidence required to mark
                                                         VERIFIED
  ----------------- ------------------ ----------------- --------------------------
  1                 Inspect workspace  NOT STARTED       Expected files exist; no
                    and scaffold                         conflicting duplicate app
                    frontend/backend                     structure
                    structure                            

  2                 Build landing page NOT STARTED       Routes/components
                    and dashboard                        inspected; user confirms
                    shell                                visual run if runtime
                                                         command is needed

  3                 Define invoice     NOT STARTED       Schema and API validation
                    model, API                           inspected;
                    contract, and                        create/list/read flow
                    SQLite persistence                   tested

  4                 Create invoice     NOT STARTED       Required fields and amount
                    form and invoice                     validation; create/read
                    detail page                          flow works

  5                 Add public         NOT STARTED       Public invoice can be
                    shareable invoice                    loaded by ID;
                    route                                invalid/missing ID handled

  6                 Confirm Testnet    NOT STARTED       Asset code/issuer and
                    asset and                            network documented; no
                    configure Stellar                    secret keys required
                    SDK                                  

  7                 Integrate          NOT STARTED       Connect/disconnect and
                    compatible wallet                    unsupported-wallet/error
                    connection                           states handled

  8                 Build and sign     NOT STARTED       User explicitly approves
                    payment                              in wallet; correct
                    transaction                          destination, asset,
                    through wallet                       amount, and network

  9                 Submit payment and NOT STARTED       Server confirms successful
                    verify                               Testnet transaction and
                    independently on                     matching payment operation
                    backend                              

  10                Enforce invoice    NOT STARTED       Only verified payment
                    payment state and                    marks invoice Paid;
                    duplicate                            duplicate/replayed tx
                    protection                           rejected

  11                Build payment      NOT STARTED       Receipt uses verified data
                    receipt and                          and correct Testnet
                    Explorer link                        Explorer URL

  12                Add loading,       NOT STARTED       Main user journeys and
                    empty, error, and                    failure paths have
                    success states                       explicit feedback

  13                Add tests for      NOT STARTED       Tests authored and
                    critical logic                       user-run output provided;
                                                         failures resolved

  14                Add README, setup  NOT STARTED       A new developer can follow
                    instructions,                        documented setup; no real
                    `.env.example`,                      secrets included
                    and demo script                      

  15                Final end-to-end   NOT STARTED       User confirms successful
                    Testnet demo and                     run and actual Testnet
                    submission                           payment verification
                    checklist                            
  ---------------------------------------------------------------------------------

### 6.1 Live status tracker (last updated: 2026-10-25)

Evidence key: **FI** = file inspection by the agent. **USER** = output or
confirmation the user reported after running commands. The agent has run
no terminal commands.

| #  | Milestone                               | Status           | Evidence |
|----|-----------------------------------------|------------------|----------|
| 1  | Inspect workspace and scaffold          | VERIFIED         | FI: `apps/api`, `apps/web`, `packages/shared`, root `package.json`, `tsconfig.base.json`, `.env.example` exist. No duplicate app structure. USER: said API and web were working. |
| 2  | Landing page and dashboard shell        | CODED — NOT RUN  | FI: `Home.tsx`, `Layout.tsx`, `Dashboard.tsx` (summary cards, status filter, empty/loading/error states) routed at `/` and `/invoices`. USER has not yet reported seeing the dashboard. Route is `/invoices`, with `/dashboard` redirecting to `/invoices`. |
| 3  | Invoice model, API, SQLite              | VERIFIED (core)  | FI: `db.ts`, `invoices.ts`, `routes/invoices.ts`, shared Zod schema. USER: confirmed create, list, summary, not-found and validation-error curl steps all work. |
| 4  | Create invoice form and detail page     | CODED — NOT RUN  | FI: `CreateInvoice.tsx` (shared Zod validation), `InvoiceDetail.tsx` (with QR code and copy button). |
| 5  | Public shareable invoice route          | CODED — NOT RUN  | FI: `GET /api/invoices/:id/public` (strips `clientEmail`, validates id format, 404 `INVOICE_NOT_FOUND`) and `/pay/:id` page (`PayInvoice.tsx`). |
| 6  | Confirm Testnet asset, configure SDK    | CODED — NOT RUN  | FI: Confirmed official Circle USDC issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` from Circle developer docs. Added to `.env.example`, `.env`, and `packages/shared`. Added `@stellar/stellar-sdk` to `apps/api`. |
| 7  | Wallet connection                       | CODED — NOT RUN  | FI: `PayInvoice.tsx` integrates `@stellar/freighter-api` with `isConnected`, `requestAccess`, connected address badge, and uninstalled-wallet fallback. |
| 8  | Build and sign payment transaction      | CODED — NOT RUN  | FI: `POST /api/invoices/:id/build-transaction` constructs testnet payment transaction XDR; `signTransaction` in Freighter prompts explicit user approval. |
| 9  | Submit and verify on backend            | CODED — NOT RUN  | FI: `verifyStellarPayment` in `stellar.ts` independently validates transaction existence, success, recipient, asset/issuer, and exact stroop amount against Horizon. |
| 10 | Paid state and replay protection        | CODED — NOT RUN  | FI: `payments` table in `db.ts` with `UNIQUE(transaction_hash)`, atomic commit in `invoices.ts`, duplicate transaction protection returns 409 `TRANSACTION_ALREADY_USED`. |
| 11 | Receipt and Explorer link               | CODED — NOT RUN  | FI: `Receipt.tsx` (`/receipt/:id`), inline receipt in `PayInvoice.tsx`, and `getExplorerTxUrl` linking to Stellar Expert Testnet. |
| 12 | Loading, empty, error, success states   | CODED — NOT RUN  | FI: Granular states for wallet connection, tx building, signing, submitting, backend verification, and error recovery. |
| 13 | Tests for critical logic                | CODED — NOT RUN  | FI: `amounts.test.ts` (precision stroop conversion tests) and `schemas.test.ts` (Zod validation and SQLite replay attack protection). Run via `npm run test`. |
| 14 | README, `.env.example`, demo script     | CODED — NOT RUN  | FI: Updated `.env.example`, `.env`, and complete `README.md` with step-by-step setup, wallet instructions, and demo script. |
| 15 | Final end-to-end Testnet demo           | NOT STARTED      | Requires user run on Testnet. |

### Current checkpoint

-   **Last VERIFIED milestones:** 1 and 3 (core).
-   **Coded and awaiting user run:** 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14.
-   **Current action needed:** User runs `npm install` to install `@stellar/stellar-sdk` and `@stellar/freighter-api`, runs `npm run test` and `npm run typecheck`, then restarts the dev servers.

## 7. Product requirements

### Pages / routes

Implement a simple, coherent flow. Adjust route names only if the
repository already has a sensible convention.

-   `/` --- Landing page explaining PayRaast and linking to the
    dashboard.
-   `/dashboard` --- Freelancer overview, invoice list, and
    create-invoice action.
-   `/invoices/new` --- Create invoice form.
-   `/invoices/:id` --- Freelancer invoice detail and sharing controls.
-   `/pay/:id` --- Public client payment page.
-   `/receipt/:id` --- Receipt for a verified payment.

Protect private dashboard operations appropriately for the chosen MVP
authentication scope. If full authentication is too much for the
hackathon, clearly label the limitation and do not pretend invoice
ownership is secure. Never put secrets in URLs.

### Invoice fields

At minimum:

-   Unique invoice ID.
-   Description/title.
-   Amount represented as a decimal string or another precision-safe
    representation; avoid floating-point arithmetic for money.
-   Asset code and issuer where applicable.
-   Network identifier (Testnet).
-   Status: `pending`, `paid`, `expired` if expiry is implemented, or
    `cancelled` if cancellation is implemented.
-   Created timestamp.
-   Optional due date and customer note.
-   Verified transaction hash and paid timestamp, populated only after
    backend verification.

### API expectations

Design clear, validated endpoints. Suggested starting point:

-   `POST /api/invoices` --- create an invoice.
-   `GET /api/invoices` --- list invoices for the demo dashboard.
-   `GET /api/invoices/:id` --- fetch invoice detail.
-   `POST /api/invoices/:id/verify-payment` --- submit a transaction
    hash for backend verification.
-   `GET /api/health` --- simple health endpoint.

Adapt these endpoints if there is a better existing structure. Never
accept a request field such as `status: "paid"` as proof of payment.

### Payment verification expectations

The backend should independently query Stellar Testnet and validate, as
supported by the selected SDK/API:

-   Transaction exists and succeeded.
-   Transaction belongs to the configured network.
-   A relevant payment operation exists.
-   Destination matches the invoice's intended recipient.
-   Asset code and issuer match the invoice's configured asset.
-   Amount matches the invoice exactly using precision-safe comparison.
-   The transaction has not already been used for another invoice.
-   The invoice is still payable and has not already been paid.
-   Any required memo or invoice reference matches, if the
    implementation uses one.

If the selected wallet flow or Stellar API makes a check impossible,
document the limitation and do not mark the payment verified until an
adequate verification path is implemented.

### UI expectations

-   Professional fintech feel, responsive layout, clear typography and
    spacing.
-   Clear Testnet labels wherever a user could mistake the payment for
    real money.
-   Amount, asset, invoice status, copy/share link, connect-wallet, pay,
    and receipt details are easy to understand.
-   Accessible labels and keyboard-operable controls.
-   Friendly errors for wallet unavailable, wrong network, user
    rejection, submission failure, unverified transaction, duplicate
    transaction, and missing invoice.
-   Do not add decorative complexity at the cost of a working end-to-end
    flow.

## 8. Definition of done

PayRaast is ready for a hackathon demo only when:

-   [ ] A freelancer can create an invoice.
-   [ ] The invoice is persisted and survives a server restart.
-   [ ] A public share URL opens the correct invoice.
-   [ ] A compatible wallet can connect on Stellar Testnet.
-   [ ] The client can review and explicitly sign the correct payment.
-   [ ] The transaction can be submitted to Testnet.
-   [ ] The backend independently verifies the transaction and payment
    details.
-   [ ] Only a verified payment marks the invoice Paid.
-   [ ] Duplicate/replayed transactions are rejected.
-   [ ] A receipt shows the verified transaction hash and correct
    Testnet Explorer link.
-   [ ] Failure states are understandable.
-   [ ] README and `.env.example` are accurate.
-   [ ] The user has run the required install/build/test commands and
    supplied successful output.
-   [ ] The user has completed a real Testnet demo end to end.

## 9. Required final response after each work session

At the end of each work session, report:

1.  **Completed:** only tasks supported by evidence.
2.  **Files changed:** list key paths.
3.  **Verification:** distinguish file inspection from commands actually
    run by the user.
4.  **Remaining:** list unfinished milestones.
5.  **Blockers/risks:** be specific.
6.  **Next step:** one small, actionable task.
7.  **Commands for the user:** exact commands and expected output, or
    say none are needed yet.

Do not say "everything works" merely because code has been written.

## 10. Recovery prompt for a lost or restarted coding agent

Copy and paste the following into the coding agent whenever it loses
context:

> Read `PAYRAAST_BUILD_GUIDE.md` completely before making changes. This
> file is the project source of truth. Inspect the actual workspace and
> compare the files against every milestone and acceptance criterion in
> the guide. Do not assume any task is complete based on chat history or
> existing comments. Update the guide's milestone statuses only when
> supported by evidence, distinguishing `CODED — NOT RUN` from
> `VERIFIED`. Then report the last verified milestone, evidence,
> remaining work, blockers, and next task. Implement only the next small
> unfinished milestone. Do not run terminal commands: if a command is
> required, show me the exact command, working directory, purpose, and
> expected output, then wait for me to run it. Do not use Mainnet, store
> secrets, fake transactions, or mark invoices Paid without independent
> backend verification on Stellar Testnet. After editing, review the
> changes and update this guide before stopping.

## 11. Instructions for the user

1.  Save this file as `PAYRAAST_BUILD_GUIDE.md` in the **root of the
    PayRaast project folder**.
2.  Open that project folder in Command Code.
3.  Tell the coding agent to read this file and begin with Milestone 1.
4.  Let the agent edit files, but run terminal commands yourself as
    agreed.
5.  After each milestone, review the progress report and make sure the
    agent updated this file.
6.  Before the deadline, prioritize a verified end-to-end Testnet
    payment over extra features or visual polish.
