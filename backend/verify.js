const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const RPC_URL = 'http://127.0.0.1:8545';
const ABI_PATH = path.resolve(__dirname, '../contracts/artifacts/contracts/AssetLifecycleRegistry.sol/AssetLifecycleRegistry.json');
const ADDRESS_PATH = path.resolve(__dirname, 'contract-address.txt');

async function main() {
    console.log("Starting Verification...");

    // 1. Wait for Server? (We assume it's running)

    // 2. Load Contract
    if (!fs.existsSync(ADDRESS_PATH)) {
        throw new Error("Contract address file not found. Deploy first.");
    }
    const contractAddress = fs.readFileSync(ADDRESS_PATH, 'utf8').trim();
    const artifact = JSON.parse(fs.readFileSync(ABI_PATH, 'utf8'));
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = await provider.getSigner(); // First account
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    console.log(`Interacting with contract at ${contractAddress}`);

    // 3. Register Asset On-Chain
    // DataHash: "QmTest", Type: 1 (Bond)
    // Note: ID is auto-incremented, starting at 1.
    const tx = await contract.registerAsset("QmTest", 1);
    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("Transaction mined. Waiting for Sync...");

    // 4. Poll API for update
    let found = false;
    // We expect ID to be 1 since it's the first asset (or we query list)
    // However, if previous tests ran, ID might be higher.
    // Let's list all assets and check for "QmTest".
    for (let i = 0; i < 10; i++) {
        try {
            const res = await fetch(`${API_URL}/assets`);
            if (res.status === 200) {
                const data = await res.json(); // Array
                const asset = data.find(a => a.dataHash === "QmTest" && a.status === 0);
                if (asset) {
                    console.log("Asset found in DB:", asset);
                    console.log("SUCCESS: Asset synced correctly.");
                    found = true;
                    break;
                }
            }
        } catch (e) {
            console.log("Waiting for server...");
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    if (!found) {
        console.error("FAILURE: Asset did not sync to DB.");
        process.exit(1);
    }

    console.log("Verification Passed!");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
