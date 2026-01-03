const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("Deploying AssetLifecycleRegistry...");

    // Get the Contract Factory
    const Registry = await hre.ethers.getContractFactory("AssetLifecycleRegistry");

    // Get Signers
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Deploy (Pass deployer as Regulator for testing)
    const registry = await Registry.deploy(deployer.address);
    await registry.waitForDeployment();

    // Grant ISSUER_ROLE to deployer so we can test registration
    console.log("Granting ISSUER_ROLE to deployer...");
    const tx = await registry.addIssuer(deployer.address);
    await tx.wait();

    const address = await registry.getAddress();
    console.log(`AssetLifecycleRegistry deployed to: ${address}`);

    // Save address to a file so backend can find it
    const backendConfigDir = path.resolve(__dirname, '../../backend');
    if (fs.existsSync(backendConfigDir)) {
        fs.writeFileSync(
            path.join(backendConfigDir, 'contract-address.txt'),
            address
        );
        console.log('Address saved to backend/contract-address.txt');
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
