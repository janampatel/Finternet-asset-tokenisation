const express = require('express');
const cors = require('cors');
const db = require('./database');
const { getContractWithSigner, currentContract } = require('./provider');
const { startSync } = require('./syncer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. POST /api/register (Metadata Only / Draft)
// Requirements: "Save draft to DB with status 0".
// Note: Real registration happens on-chain. This is for off-chain metadata prep.
app.post('/api/register', (req, res) => {
    const { dataHash, assetType, owner } = req.body;

    // We use a temporary ID or negative ID for drafts? 
    // Or we expect the user to provide the intended ID?
    // Let's assume this is strictly creating a record for the UI to then use to submit on-chain.
    // Or, we just return success and let the user call the blockchain.

    // Based on user request: "Save draft to DB with status 0".
    // Problem: ID is Primary Key. We don't have the Token ID yet until minting.
    // Solution: We require `id` or we generate one but it might conflict with chain.
    // Refinement: The user prompt says "Matches Token ID". 
    // Let's trust the input contains an ID or we create a "pending" entry without ID if possible?
    // Actually, let's just insert what we have. If ID is missing, we can't insert into PK.
    // "POST /api/register - Input: { dataHash, assetType, owner }". No ID specified.
    // Maybe we just store off-chain metadata and return a reference?
    // Let's implement it as: Store in a separate 'drafts' table ideally, but we only have 'assets'.
    // Let's assume the Client Generates the ID (random uint256) or we return it.
    // For simplicity: We will generate a random large integer as ID for the draft.

    // WAIT: The event syncer will overwrite this when the event comes in. 
    // So we can return the ID we generated so the frontend uses it for the transaction.

    const id = Math.floor(Math.random() * 1000000); // Simple random ID for demo
    const status = 0; // Registered
    const now = Date.now();

    const sql = `INSERT INTO assets (id, dataHash, assetType, status, owner, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, dataHash, assetType, status, owner, now], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Asset draft created", assetId: id });
    });
});

// 2. GET /api/assets
app.get('/api/assets', (req, res) => {
    db.all("SELECT * FROM assets", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. GET /api/assets/:id
app.get('/api/assets/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM assets WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Asset not found" });
        res.json(row);
    });
});

// 4. POST /api/verify (Regulator Simulation)
app.post('/api/verify', async (req, res) => {
    const { assetId, regulatorPrivateKey } = req.body;
    try {
        const contract = await getContractWithSigner(regulatorPrivateKey);
        const tx = await contract.verifyAsset(assetId);
        await tx.wait();
        res.json({ message: "Asset verification submitted", txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. POST /api/freeze (Regulator Simulation)
app.post('/api/freeze', async (req, res) => {
    const { assetId, regulatorPrivateKey } = req.body;
    try {
        const contract = await getContractWithSigner(regulatorPrivateKey);
        const tx = await contract.freezeAsset(assetId);
        await tx.wait();
        res.json({ message: "Asset frozen submitted", txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);

    // Start Event Syncer
    startSync();
});
