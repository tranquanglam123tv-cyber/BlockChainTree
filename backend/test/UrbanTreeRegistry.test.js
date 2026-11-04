const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🌳 UrbanTreeRegistry Smart Contract Tests", function () {
    let UrbanTreeRegistry;
    let registry;
    let owner;
    let staffWallet;
    let unauthorizedWallet;

    // Dữ liệu mẫu kiểm thử
    const SAMPLE_RECORD_ID = "TREE-Q1-2026-001";
    const SAMPLE_RECORD_TYPE = "TREE_PROFILE";
    const SAMPLE_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // SHA-256 hash chuẩn
    const TAMPERED_HASH = "1111111111111111111111111111111111111111111111111111111111111111"; // Mã băm giả mạo

    beforeEach(async function () {
        // 1. Lấy 3 tài khoản ví giả lập từ Hardhat
        [owner, staffWallet, unauthorizedWallet] = await ethers.getSigners();

        // 2. Nạp bản thiết kế Contract
        UrbanTreeRegistry = await ethers.getContractFactory("UrbanTreeRegistry");

        // 3. Tiến hành deploy hợp đồng lên mạng ảo
        registry = await UrbanTreeRegistry.deploy();
        await registry.waitForDeployment();
    });

    // ===============================================================
    // PHẦN 1: KIỂM TRA PHÂN QUYỀN (ACCESS CONTROL)
    // ===============================================================
    describe("1. Khởi tạo & Phân quyền", function () {
        it("Khi deploy xong, owner phải là người tạo hợp đồng", async function () {
            expect(await registry.owner()).to.equal(owner.address);
        });

        it("Owner có thể cấp quyền ghi dữ liệu cho ví nhân viên", async function () {
            await registry.connect(owner).authorizeRecorder(staffWallet.address);
            expect(await registry.authorizedRecorders(staffWallet.address)).to.be.true;
        });

        it("Người ngoài (unauthorizedWallet) không thể tự ý cấp quyền", async function () {
            await expect(
                registry.connect(unauthorizedWallet).authorizeRecorder(unauthorizedWallet.address)
            ).to.be.revertedWith("UrbanTree: Caller is not the contract owner");
        });
    });

    // ===============================================================
    // PHẦN 2: KIỂM TRA GHI DẤU BẢN GHI (ANCHOR RECORD)
    // ===============================================================
    describe("2. Ghi dấu bản ghi lên Blockchain", function () {
        it("Nhân viên được cấp quyền có thể ghi dấu hồ sơ thành công", async function () {
            // Cấp quyền cho nhân viên
            await registry.connect(owner).authorizeRecorder(staffWallet.address);

            // Nhân viên gửi mã cây và mã băm lên chuỗi
            await registry.connect(staffWallet).anchorRecord(
                SAMPLE_RECORD_ID,
                SAMPLE_RECORD_TYPE,
                SAMPLE_HASH
            );

            // Kiểm tra: Tổng số bản ghi trên chuỗi phải tăng lên 1
            expect(await registry.getRecordCount()).to.equal(1);

            // Đọc lại bản ghi vừa ghi xem có đúng thông tin không
            const record = await registry.getRecord(SAMPLE_RECORD_ID);
            expect(record.recordId).to.equal(SAMPLE_RECORD_ID);
            expect(record.dataHash).to.equal(SAMPLE_HASH);
            expect(record.recorder).to.equal(staffWallet.address);
            expect(record.exists).to.be.true;
        });

        it("Hacker không có quyền sẽ BỊ CHẶN khi cố ghi dữ liệu", async function () {
            await expect(
                registry.connect(unauthorizedWallet).anchorRecord(
                    SAMPLE_RECORD_ID,
                    SAMPLE_RECORD_TYPE,
                    SAMPLE_HASH
                )
            ).to.be.revertedWith("UrbanTree: Caller is not authorized to anchor records");
        });

        it("CHỐNG GIAN LẬN: Tuyệt đối không cho phép ghi đè lên mã cây đã có", async function () {
            // Lần 1: Ghi thành công mã cây TREE-Q1-2026-001
            await registry.connect(owner).anchorRecord(SAMPLE_RECORD_ID, SAMPLE_RECORD_TYPE, SAMPLE_HASH);

            // Lần 2: Cố tình ghi đè lại mã cây đó với mã băm mới -> Phải bị từ chối ngay!
            await expect(
                registry.connect(owner).anchorRecord(SAMPLE_RECORD_ID, SAMPLE_RECORD_TYPE, TAMPERED_HASH)
            ).to.be.revertedWith("UrbanTree: Record already anchored (Tampering prevented)");
        });
    });

    // ===============================================================
    // PHẦN 3: KIỂM TRA THUẬT TOÁN ĐỐI CHIẾU XÁC MINH (VERIFY & ZERO MISMATCH)
    // ===============================================================
    describe("3. Xác minh tính toàn vẹn dữ liệu (Cổng A19)", function () {
        beforeEach(async function () {
            // Trước khi test xác minh, ghi sẵn 1 bản ghi chuẩn lên mạng
            await registry.connect(owner).anchorRecord(SAMPLE_RECORD_ID, SAMPLE_RECORD_TYPE, SAMPLE_HASH);
        });

        it("TRƯỜNG HỢP 1: Dữ liệu chuẩn xác 100% -> Trả về isValid = TRUE (Tích xanh)", async function () {
            const [isValid, isExisted, timestamp, recorder, storedHash] = await registry.verifyRecord(
                SAMPLE_RECORD_ID,
                SAMPLE_HASH
            );

            expect(isValid).to.be.true;
            expect(isExisted).to.be.true;
            expect(storedHash).to.equal(SAMPLE_HASH);
        });

        it("TRƯỜNG HỢP 2: Dữ liệu Database bị sửa lén -> Trả về isValid = FALSE (Cảnh báo đỏ)", async function () {
            // Giả lập ai đó lén sửa Database -> sinh ra mã băm TAMPERED_HASH khác với ban đầu
            const [isValid, isExisted] = await registry.verifyRecord(
                SAMPLE_RECORD_ID,
                TAMPERED_HASH
            );

            expect(isExisted).to.be.true;
            expect(isValid).to.be.false;
        });
    });
});