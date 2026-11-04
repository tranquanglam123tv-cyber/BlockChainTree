const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Module Kết Nối và Thao Tác Hợp Đồng Thông Minh (Blockchain Client)
 * Dành cho Dự án UrbanTree (CNTT2311)
 * @author Tran Quang Lam (MSSV: 2311074)
 */

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
// Khóa riêng mặc định của Account #0 trên node Hardhat dev
const DEFAULT_PRIVATE_KEY =
    process.env.DEPLOYER_PRIVATE_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const ABI = [
    'function owner() external view returns (address)',
    'function authorizedRecorders(address) external view returns (bool)',
    'function authorizeRecorder(address _account) external',
    'function revokeRecorder(address _account) external',
    'function anchorRecord(string _recordId, string _recordType, string _dataHash) external',
    'function verifyRecord(string _recordId, string _currentHash) external view returns (bool isValid, bool isExisted, uint256 timestamp, address recorder, string memory storedHash)',
    'function getRecord(string _recordId) external view returns (tuple(string recordId, string recordType, string dataHash, uint256 timestamp, address recorder, bool exists))',
    'function getRecordCount() external view returns (uint256)',
    'function getAllRecordIds() external view returns (string[] memory)'
];

let cachedDeployment = null;

function getDeploymentConfig() {
    if (cachedDeployment) return cachedDeployment;
    const deploymentPath = path.resolve(__dirname, '../../deployed-contract.json');
    if (!fs.existsSync(deploymentPath)) {
        throw new Error(`blockchainClient: Không tìm thấy file cấu hình triển khai tại ${deploymentPath}. Vui lòng chạy lệnh 'npm run chain:deploy' trước.`);
    }
    const raw = fs.readFileSync(deploymentPath, 'utf8');
    cachedDeployment = JSON.parse(raw);
    return cachedDeployment;
}

function getProvider() {
    return new ethers.JsonRpcProvider(RPC_URL);
}

function getSigner(provider = getProvider()) {
    return new ethers.Wallet(DEFAULT_PRIVATE_KEY, provider);
}

function getContract(signerOrProvider) {
    const deployment = getDeploymentConfig();
    const target = signerOrProvider || getSigner();
    return new ethers.Contract(deployment.contractAddress, ABI, target);
}

/**
 * Neo bản ghi mã băm lên chuỗi khối (Gửi Transaction)
 * @param {string} recordId Mã định danh bản ghi (VD: "TREE-001")
 * @param {string} recordType Loại: "TREE_PROFILE" | "CARE_LOG" | "INCIDENT_REPORT"
 * @param {string} dataHash Mã băm SHA-256 (64 hex characters)
 * @returns {Promise<Object>} { txHash, blockNumber, gasUsed, recorder }
 */
async function anchor(recordId, recordType, dataHash) {
    if (!recordId || !recordType || !dataHash) {
        throw new Error('blockchainClient.anchor: Thiếu tham số (recordId, recordType, dataHash)');
    }
    if (dataHash.length !== 64) {
        throw new Error(`blockchainClient.anchor: dataHash phải có đúng 64 ký tự hex (hiện tại: ${dataHash.length})`);
    }

    const signer = getSigner();
    const contract = getContract(signer);

    const tx = await contract.anchorRecord(recordId, recordType, dataHash);
    const receipt = await tx.wait();

    return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : null,
        recorder: signer.address
    };
}

/**
 * Xác thực toàn vẹn bản ghi so với dữ liệu chuỗi khối (Hàm View - 0 gas)
 * @param {string} recordId
 * @param {string} currentHash
 * @returns {Promise<Object>}
 */
async function verify(recordId, currentHash) {
    if (!recordId) {
        throw new Error('blockchainClient.verify: recordId không được để trống');
    }

    const provider = getProvider();
    const contract = getContract(provider);

    const [isValid, isExisted, timestamp, recorder, storedHash] = await contract.verifyRecord(
        recordId,
        currentHash || ''
    );

    return {
        recordId,
        isValid: Boolean(isValid),
        isExisted: Boolean(isExisted),
        timestamp: Number(timestamp),
        dateFormatted: Number(timestamp) > 0 ? new Date(Number(timestamp) * 1000).toISOString() : null,
        recorder,
        storedHash,
        currentHash: currentHash || null
    };
}

/**
 * Đọc trực tiếp bản ghi từ Smart Contract
 * @param {string} recordId
 */
async function getRecord(recordId) {
    const provider = getProvider();
    const contract = getContract(provider);
    const rec = await contract.getRecord(recordId);

    return {
        recordId: rec.recordId,
        recordType: rec.recordType,
        dataHash: rec.dataHash,
        timestamp: Number(rec.timestamp),
        dateFormatted: new Date(Number(rec.timestamp) * 1000).toISOString(),
        recorder: rec.recorder,
        exists: rec.exists
    };
}

/**
 * Lấy danh sách toàn bộ bản ghi phục vụ Explorer A18
 */
async function getAllRecords() {
    const provider = getProvider();
    const contract = getContract(provider);

    const count = Number(await contract.getRecordCount());
    const ids = await contract.getAllRecordIds();

    const records = [];
    for (const id of ids) {
        try {
            const rec = await contract.getRecord(id);
            records.push({
                recordId: rec.recordId,
                recordType: rec.recordType,
                dataHash: rec.dataHash,
                timestamp: Number(rec.timestamp),
                dateFormatted: new Date(Number(rec.timestamp) * 1000).toISOString(),
                recorder: rec.recorder
            });
        } catch (e) {
            // bỏ qua nếu lỗi
        }
    }

    return {
        totalRecords: count,
        records
    };
}

/**
 * Kiểm tra trạng thái kết nối mạng Blockchain
 */
async function getNetworkStatus() {
    try {
        const provider = getProvider();
        const blockNumber = await provider.getBlockNumber();
        const signer = getSigner(provider);
        const balance = await provider.getBalance(signer.address);
        const deployment = getDeploymentConfig();

        return {
            status: 'CONNECTED',
            rpcUrl: RPC_URL,
            blockNumber,
            contractAddress: deployment.contractAddress,
            deployerAddress: signer.address,
            deployerBalanceEth: ethers.formatEther(balance)
        };
    } catch (err) {
        return {
            status: 'DISCONNECTED',
            rpcUrl: RPC_URL,
            error: err.message
        };
    }
}

module.exports = {
    getDeploymentConfig,
    getProvider,
    getSigner,
    getContract,
    anchor,
    verify,
    getRecord,
    getAllRecords,
    getNetworkStatus
};
