const { currentContract } = require('./provider');
const db = require('./database');

function startSync() {
    if (!currentContract) {
        console.error("Contract not initialized. Skipping Event Sync.");
        return;
    }

    console.log("Starting Event Syncer...");

    // 1. AssetRegistered
    currentContract.on("AssetRegistered", (id, issuer, assetType, dataHash, event) => {
        console.log(`[Event] AssetRegistered: ID=${id}, Hash=${dataHash}`);

        // We typically INSERT here. If data already exists (via Metadata API), we UPDATE.
        // For robustness, we try INSERT OR IGNORE then UPDATE, or just basic logic.
        // "Sync pattern": on-chain is truth. Overwrite local.

        const sql = `
            INSERT INTO assets (id, dataHash, assetType, status, owner, updatedAt)
            VALUES (?, ?, ?, 0, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                dataHash = excluded.dataHash,
                assetType = excluded.assetType,
                status = 0,
                owner = excluded.owner,
                updatedAt = excluded.updatedAt
        `;

        db.run(sql, [
            Number(id),
            dataHash,
            Number(assetType),
            issuer,
            Date.now()
        ], (err) => {
            if (err) console.error("DB Error AssetRegistered:", err.message);
        });
    });

    // 2. AssetVerified
    currentContract.on("AssetVerified", (id, regulator, event) => {
        console.log(`[Event] AssetVerified: ID=${id} by ${regulator}`);
        updateStatus(id, 1);
    });

    // 3. AssetTokenized
    currentContract.on("AssetTokenized", (id, issuer, event) => {
        console.log(`[Event] AssetTokenized: ID=${id}`);
        updateStatus(id, 2);
    });

    // 4. AssetActivated
    currentContract.on("AssetActivated", (id, event) => {
        console.log(`[Event] AssetActivated: ID=${id}`);
        updateStatus(id, 3);
    });

    // 5. AssetFrozen
    currentContract.on("AssetFrozen", (id, regulator, event) => {
        console.log(`[Event] AssetFrozen: ID=${id}`);
        updateStatus(id, 4);
    });

    // 6. AssetRedeemed
    currentContract.on("AssetRedeemed", (id, issuer, event) => {
        console.log(`[Event] AssetRedeemed: ID=${id}`);
        updateStatus(id, 5);
    });
}

function updateStatus(id, status) {
    db.run("UPDATE assets SET status = ?, updatedAt = ? WHERE id = ?", [status, Date.now(), Number(id)], (err) => {
        if (err) console.error(`DB Error updating status for ${id}:`, err.message);
    });
}

module.exports = { startSync };
