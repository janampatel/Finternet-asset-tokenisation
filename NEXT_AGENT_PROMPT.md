# PROMPT FOR NEXT AGENT: Backend Implementation

**Role**: You are an expert Backend Developer specializing in Web3/Ethers.js integrations.

**Project**: Compliance-Aware Asset Lifecycle
**Goal**: Build a Node.js/Express backend that mirrors the on-chain state of the `AssetLifecycleRegistry`.

## 1. Project Context & Current State
- **Root Path**: `c:/Users/janam/Desktop/Finternet`
- **`/contracts`**: **COMPLETE & VERIFIED**.
    - Hardhat environment fixed (CommonJS).
    - Tests passing (`npx hardhat test`).
    - Smart Contract: `AssetLifecycleRegistry.sol` (deployed to local hardhat net for testing).
- **`/backend`**: **INITIALIZED**.
    - Users ran `npm init -y`.
    - Directory exists but is empty of logic.
- **`/frontend`**: Empty.

## 2. Your Mission (Backend Implementation)
You must implement the backend in `/backend` using **Node.js, Express, SQLite, and Ethers.js**.

### A. Technical Requirements
- **Server**: Express.js
- **Database**: `sqlite3` or `better-sqlite3`. Single table `assets`.
- **Blockchain**: `ethers` v6.
- **Environment**: Hardhat Local Network (for dev/testing).

### B. Database Schema (`assets` table)
Mirror the on-chain struct:
```sql
CREATE TABLE assets (
    id INTEGER PRIMARY KEY,         -- Matches Token ID
    dataHash TEXT NOT NULL,         -- IPFS/Off-chain hash
    assetType INTEGER NOT NULL,     -- 0: Real Estate, 1: Bond, 2: Art
    status INTEGER DEFAULT 0,       -- 0: Registered, 1: Verified, 2: Tokenized, 3: Active, 4: Frozen, 5: Redeemed
    owner TEXT NOT NULL,            -- Ethereum Address
    updatedAt INTEGER               -- Timestamp
);
```

### C. API Endpoints
All endpoints should return JSON.

1.  **`POST /api/register`**
    - **Input**: `{ dataHash, assetType, owner }`
    - **Action**: Save draft to DB with status `0` (Registered).
    - *Note*: In a real app, this happens on-chain first, but for this "Lifecycle" UI, we might want to store metadata off-chain before the tx or strictly index from chain. **Decision**: Follow the "Sync" pattern. This endpoint just prepares metadata.
    - **Refined Requirement**: **Strictly Indexer Logic**.
        - **DO NOT** create assets via API. Assets are created on-chain.
        - **EXCEPTION**: `POST /api/metadata` (optional) to store details before on-chain tx.
        - **Actually**, user requirements said: "`POST /register`: Save off-chain metadata." So implement that.

2.  **`GET /api/assets`**
    - Returns all assets from SQLite.

3.  **`GET /api/assets/:id`**
    - Returns single asset details.

4.  **`POST /api/verify`** (Regulator Only Simulation)
    - **Input**: `{ assetId, regulatorPrivateKey }`
    - **Action**: `ethers` wallet calls `verifyAsset(id)` on smart contract.

5.  **`POST /api/freeze`** (Regulator Only Simulation)
    - **Input**: `{ assetId, regulatorPrivateKey }`
    - **Action**: `ethers` wallet calls `freezeAsset(id)` on smart contract.

### D. Event Listener (The Core)
Create a script (or part of `server.js`) that listens to Smart Contract events and updates SQLite:
- `AssetRegistered(id, issuer, assetType, dataHash)` -> `INSERT INTO assets ...`
- `AssetVerified(id, regulator)` -> `UPDATE assets SET status = 1 ...`
- `AssetTokenized(id, issuer)` -> `UPDATE assets SET status = 2 ...`
- `AssetActivated(id)` -> `UPDATE assets SET status = 3 ...`
- `AssetFrozen(id, regulator)` -> `UPDATE assets SET status = 4 ...`
- `AssetRedeemed(id, issuer)` -> `UPDATE assets SET status = 5 ...`

## 3. Implementation Steps for You
1.  **Install Dependencies**: `npm install express sqlite3 ethers dotenv cors` inside `/backend`.
2.  **Setup DB**: Create `database.js` to init SQLite.
3.  **Setup Ethers**: Create `provider.js` to connect to Hardhat node (`http://127.0.0.1:8545`).
4.  **Implement Server**: `index.js` with API routes.
5.  **Implement Syncer**: `syncer.js` to listen to events.

## 4. Important Notes
- Use **CommonJS** (`require`) to avoid conflicts again.
- Ensure the Hardhat node is running (`npx hardhat node`) before starting the backend (you can instrust the user to run it).
- ABI: You'll need to read the ABI from `../contracts/artifacts/contracts/AssetLifecycleRegistry.sol/AssetLifecycleRegistry.json`.

**Constraint**: Keep it simple. No complex ORMs (use raw SQL or simple query builder). Focus on the "Lifecycle State Machine" accuracy.
