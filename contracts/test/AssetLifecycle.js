const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AssetLifecycleRegistry", function () {

    // Define Enums locally for clarity in tests
    const AssetState = {
        REGISTERED: 0,
        VERIFIED: 1,
        TOKENIZED: 2,
        ACTIVE: 3,
        FROZEN: 4,
        REDEEMED: 5
    };

    const AssetType = {
        REAL_ESTATE: 0,
        BOND: 1,
        ART: 2
    };

    async function deployFixture() {
        // Contracts are deployed using the first signer/account by default
        const [regulator, issuer, investor, otherAccount] = await ethers.getSigners();

        const AssetLifecycleRegistry = await ethers.getContractFactory("AssetLifecycleRegistry");
        // Deploy with regulator as the initial admin/regulator
        const registry = await AssetLifecycleRegistry.deploy(regulator.address);

        // Grant ISSUER_ROLE to the issuer account
        await registry.addIssuer(issuer.address);

        return { registry, regulator, issuer, investor, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right regulator", async function () {
            const { registry, regulator } = await loadFixture(deployFixture);
            const REGULATOR_ROLE = await registry.REGULATOR_ROLE();
            expect(await registry.hasRole(REGULATOR_ROLE, regulator.address)).to.be.true;
        });

        it("Should allow regulator to add issuer", async function () {
            const { registry, issuer } = await loadFixture(deployFixture);
            const ISSUER_ROLE = await registry.ISSUER_ROLE();
            expect(await registry.hasRole(ISSUER_ROLE, issuer.address)).to.be.true;
        });
    });

    describe("State Machine Happy Path", function () {
        const dataHash = "QmTestHash123";
        const assetType = AssetType.REAL_ESTATE;

        it("Should go through the full lifecycle: Register -> Verify -> Tokenize -> Activate -> Redeem", async function () {
            const { registry, regulator, issuer } = await loadFixture(deployFixture);

            // 1. Register
            await expect(registry.connect(issuer).registerAsset(dataHash, assetType))
                .to.emit(registry, "AssetRegistered")
                .withArgs(1, issuer.address, assetType, dataHash);

            let asset = await registry.assets(1);
            expect(asset.state).to.equal(AssetState.REGISTERED);

            // 2. Verify (Regulator)
            await expect(registry.connect(regulator).verifyAsset(1))
                .to.emit(registry, "AssetVerified")
                .withArgs(1, regulator.address);

            asset = await registry.assets(1);
            expect(asset.state).to.equal(AssetState.VERIFIED);

            // 3. Tokenize (Issuer)
            await expect(registry.connect(issuer).tokenizeAsset(1))
                .to.emit(registry, "AssetTokenized")
                .withArgs(1, issuer.address);

            asset = await registry.assets(1);
            expect(asset.state).to.equal(AssetState.TOKENIZED);

            // 4. Activate (Regulator)
            // Note: activateAsset is not present in the original snippet but implied by requirements. 
            // Checking my previous code: Yes, I implemented activateAsset.
            await expect(registry.connect(regulator).activateAsset(1))
                .to.emit(registry, "AssetActivated")
                .withArgs(1);

            asset = await registry.assets(1);
            expect(asset.state).to.equal(AssetState.ACTIVE);

            // 5. Redeem (Issuer)
            await expect(registry.connect(issuer).redeemAsset(1))
                .to.emit(registry, "AssetRedeemed")
                .withArgs(1, issuer.address);

            asset = await registry.assets(1);
            expect(asset.state).to.equal(AssetState.REDEEMED);
        });
    });

    describe("Invariants & Failure Modes", function () {
        const dataHash = "QmFailHash";
        const assetType = AssetType.BOND;

        it("Should NOT allow unauthorized user to register", async function () {
            const { registry, otherAccount } = await loadFixture(deployFixture);
            await expect(registry.connect(otherAccount).registerAsset(dataHash, assetType))
                .to.be.revertedWithCustomError(registry, "UnauthorizedIssuer");
        });

        it("Should NOT allow skipping states (Register -> Tokenize directly)", async function () {
            const { registry, issuer } = await loadFixture(deployFixture);
            await registry.connect(issuer).registerAsset(dataHash, assetType);

            // Try to tokenize immediately (skipping VERIFIED)
            await expect(registry.connect(issuer).tokenizeAsset(1))
                .to.be.revertedWithCustomError(registry, "InvalidStateTransition")
                .withArgs(AssetState.REGISTERED, AssetState.VERIFIED);
        });

        it("Should NOT allow non-regulator to freeze", async function () {
            const { registry, issuer, regulator } = await loadFixture(deployFixture);
            await registry.connect(issuer).registerAsset(dataHash, assetType);
            await registry.connect(regulator).verifyAsset(1);
            await registry.connect(issuer).tokenizeAsset(1);
            await registry.connect(regulator).activateAsset(1);

            // Issuer tries to freeze
            await expect(registry.connect(issuer).freezeAsset(1))
                .to.be.revertedWithCustomError(registry, "UnauthorizedRegulator");
        });

        it("Should allow Freeze -> Active (Unfreeze)", async function () {
            const { registry, regulator, issuer } = await loadFixture(deployFixture);
            await registry.connect(issuer).registerAsset(dataHash, assetType);
            await registry.connect(regulator).verifyAsset(1);
            await registry.connect(issuer).tokenizeAsset(1);
            await registry.connect(regulator).activateAsset(1);

            // Freeze
            await registry.connect(regulator).freezeAsset(1);
            let asset = await registry.assets(1);
            expect(asset.state).to.equal(AssetState.FROZEN);

            // Unfreeze (Activate)
            await registry.connect(regulator).activateAsset(1);
            asset = await registry.assets(1);
            expect(asset.state).to.equal(AssetState.ACTIVE);
        });
    });
});
