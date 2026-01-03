const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const RPC_URL = 'http://127.0.0.1:8545';
const ABI_PATH = path.resolve(__dirname, '../contracts/artifacts/contracts/AssetLifecycleRegistry.sol/AssetLifecycleRegistry.json');
const ADDRESS_PATH = path.resolve(__dirname, 'contract-address.txt');

// Provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Load ABI
let abi = null;
try {
    const artifact = JSON.parse(fs.readFileSync(ABI_PATH, 'utf8'));
    abi = artifact.abi;
} catch (error) {
    console.error(`Error loading ABI from ${ABI_PATH}:`, error.message);
}

// Load Address (Deploy first!)
let contractAddress = null;
try {
    if (fs.existsSync(ADDRESS_PATH)) {
        contractAddress = fs.readFileSync(ADDRESS_PATH, 'utf8').trim();
    }
} catch (error) {
    console.warn("Contract address not found. Make sure to deploy the contract first.");
}

let contract = null;
if (abi && contractAddress) {
    contract = new ethers.Contract(contractAddress, abi, provider);
}

// Helper to get signer (for simulation)
const getSigner = async (privateKey) => {
    if (!privateKey) return null;
    return new ethers.Wallet(privateKey, provider);
};

const getContractWithSigner = async (privateKey) => {
    if (!contract) throw new Error("Contract not initialized");
    const wallet = await getSigner(privateKey);
    return contract.connect(wallet);
};

module.exports = {
    provider,
    currentContract: contract,
    getContractWithSigner,
    getContractAddress: () => contractAddress,
    getAbi: () => abi
};
