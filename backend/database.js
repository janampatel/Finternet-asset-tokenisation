const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database (creates file if not exists)
const dbPath = path.resolve(__dirname, 'lifecycle.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Initialize Schema
        const schema = `
            CREATE TABLE IF NOT EXISTS assets (
                id INTEGER PRIMARY KEY,         -- Matches Token ID
                dataHash TEXT NOT NULL,         -- IPFS/Off-chain hash
                assetType INTEGER NOT NULL,     -- 0: Real Estate, 1: Bond, 2: Art
                status INTEGER DEFAULT 0,       -- 0: Registered, 1: Verified, 2: Tokenized, 3: Active, 4: Frozen, 5: Redeemed
                owner TEXT NOT NULL,            -- Ethereum Address
                updatedAt INTEGER               -- Timestamp
            )
        `;

        db.run(schema, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Assets table ready.');
            }
        });
    }
});

module.exports = db;
