# 🌐 Finternet: Compliance-Aware Asset Lifecycle

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-Glassmorphism-38bdf8)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.28-363636)

> **The Future of Finance**: A Real-World Asset (RWA) Tokenization Dashboard bridging the gap between Issuers, Regulators, and Investors.

## 🚀 Overview

Finternet is a full-stack decentralized application (dApp) that manages the complete lifecycle of tokenized assets. It enforces compliance on-chain while providing a seamless, "glassmorphic" user experience off-chain.

**Key Features:**
- **Asset Registration**: Issuers can mint real-world assets (Real Estate, Art, Bonds) as unique on-chain records.
- **Compliance Engine**: A simulated Regulator persona can "Verify" or "Freeze" assets, enforcing regulatory standards.
- **Lifecycle Management**: Tokenization and Redemption flows gated by strict smart contract state machines.
- **Real-Time Sync**: A Node.js backend listens to blockchain events to maintain a high-performance off-chain index.

## 🏗 Architecture

```mermaid
graph TD
    User[User / Wallet] -->|Interacts| Frontend[Next.js Frontend]
    Frontend -->|Reads/Writes| Contract[AssetLifecycleRegistry (Hardhat)]
    Frontend -->|Reads| BackendAPI[Node.js Backend API]
    
    Contract -->|Emits Events| Syncer[Event Listener Service]
    Syncer -->|Updates| DB[(SQLite Database)]
    BackendAPI -->|Queries| DB
    
    Regulator[Regulator Persona] -->|Signs Txs| BackendAPI
    BackendAPI -->|Executes Compliance| Contract
```

## 🛠 Tech Stack

- **Blockchain**: Hardhat, Solidity, Ethers.js v6
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Glassmorphism), SWR
- **Backend**: Node.js, Express, SQLite
- **DevOps**: GitHub Actions, Monorepo structure

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MetaMask (Browser Extension)
- Git

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/Finternet.git
    cd Finternet
    ```

2.  **Install Dependencies**
    ```bash
    # Root dependencies (if any)
    npm install

    # Install Sub-packages
    cd contracts && npm install
    cd ../backend && npm install
    cd ../frontend && npm install
    ```

3.  **Start the Blockchain (Terminal 1)**
    ```bash
    cd contracts
    npx hardhat node
    ```

4.  **Deploy Smart Contracts (Terminal 2)**
    ```bash
    cd contracts
    # Deploy to local network
    npx hardhat run scripts/deploy.js --network localhost
    ```

5.  **Start Backend Service (Terminal 3)**
    ```bash
    cd backend
    npm start
    ```

6.  **Start Frontend Dashboard (Terminal 4)**
    ```bash
    cd frontend
    npm run dev
    ```

7.  **Access App**: Open [http://localhost:3000](http://localhost:3000)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
