const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("==================================================");
    console.log("🌳 UrbanTree — Triển khai Smart Contract lên Blockchain");
    console.log("==================================================");

    // 1. Lấy thông tin ví của người deploy (Admin)
    const [deployer] = await hre.ethers.getSigners();
    console.log(`📍 Địa chỉ ví Deployer : ${deployer.address}`);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 Số dư ví ban đầu   : ${hre.ethers.formatEther(balance)} ETH`);

    // 2. Nạp Factory và tiến hành Deploy hợp đồng UrbanTreeRegistry
    const UrbanTreeRegistry = await hre.ethers.getContractFactory("UrbanTreeRegistry");
    const registry = await UrbanTreeRegistry.deploy();
    await registry.waitForDeployment();

    const deployedAddress = await registry.getAddress();
    console.log(`\n✅ Smart Contract đã triển khai thành công!`);
    console.log(`👉 Địa chỉ Contract   : ${deployedAddress}`);

    // 3. Tự động lưu địa chỉ Contract vào file JSON để Backend NodeJS đọc và kết nối
    const deploymentData = {
        network: hre.network.name,
        chainId: hre.network.config.chainId || 31337,
        contractAddress: deployedAddress,
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };

    const outputPath = path.join(__dirname, "..", "deployed-contract.json");
    fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
    console.log(`📁 Đã lưu cấu hình vào  : ${outputPath}`);
    console.log("==================================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Lỗi triển khai:", error);
        process.exit(1);
    });