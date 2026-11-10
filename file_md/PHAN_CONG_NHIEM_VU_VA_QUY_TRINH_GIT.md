# 🌳 TÀI LIỆU ĐẶC TẢ KỸ THUẬT & PHÂN CÔNG NHIỆM VỤ CHI TIẾT (MASTER SPECIFICATION)
## DỰ ÁN: URBANTREE — HỆ THỐNG QUẢN LÝ CÂY XANH ĐÔ THỊ TÍCH HỢP QR CODE & BLOCKCHAIN
> **Mã học phần:** CNTT2311 | **Phiên bản tài liệu:** v2.0 (Toàn diện & Chi tiết hóa cho AI Coding Assistant)  
> **Thành viên thực hiện:**  
> 1. **Trần Quang Lâm (MSSV: 2311074)** — Phụ trách: Blockchain, Smart Contract, Mật mã học (Hashing), Cổng bảo chứng toàn vẹn A18/A19  
> 2. **Đoàn Thế Thuần (MSSV: 2311031)** — Phụ trách: Backend RESTful API, SQLite Database, Nghiệp vụ Cây xanh, Sự cố, Chăm sóc & QR Code  

---

## 🧭 HƯỚNG DẪN DÀNH CHO CON CHAT / AI AGENT (PROMPT-DRIVEN DIRECTIVE)
Khi người dùng yêu cầu con chat thực hiện bất kỳ nhiệm vụ nào trong dự án này:
1. **Xác định danh tính:** Đọc kỹ xem bạn đang đóng vai trò thực hiện công việc cho **BẠN THUần (Thuần)** hay **BẠN LÂM (Lâm)**.
2. **Quy tắc bất khả xâm phạm:**
   - AI của Thuận: **CHỈ ĐƯỢC PHÉP** tạo/sửa các file thuộc phạm vi Backend/Database được cấp phép tại **Mục 2**. Tuyệt đối KHÔNG chạm vào thư mục `contracts/`, `test/`, `scripts/`, `registry.js`, `services/blockchainClient.js`.
   - AI của Lâm: **CHỈ ĐƯỢC PHÉP** tạo/sửa các file thuộc phạm vi Blockchain/Smart Contract được cấp phép tại **Mục 2**. Tuyệt đối KHÔNG chạm vào `config/db.js`, `models/`, `controllers/`.
3. **Tuân thủ chuẩn dữ liệu:** Khi sinh API hoặc thuật toán băm, bắt buộc đối chiếu với **Mục 3 (Chuẩn băm SHA-256)** và **Mục 4, 5 (Đặc tả JSON Schemas)**.
4. **Nghiệm thu:** Sau khi viết code, AI phải tự chạy câu lệnh kiểm thử tương ứng được ghi trong tài liệu trước khi thông báo hoàn tất.

---

## 📁 1. KIẾN TRÚC THƯ MỤC DỰ ÁN & MA TRẬN PHÂN QUYỀN FILE

```
d:\TQLCNTT2311074\Nam4HK1\GUI\Da4\backend\
│
├── contracts/                               👉 [QUYỀN HẠN: LÂM]
│   └── UrbanTreeRegistry.sol                # Hợp đồng thông minh lưu trữ bản ghi bất biến
│
├── scripts/                                 👉 [QUYỀN HẠN: LÂM]
│   └── deploy.js                            # Script triển khai hợp đồng & sinh deployed-contract.json
│
├── test/                                    👉 [QUYỀN HẠN: LÂM]
│   └── UrbanTreeRegistry.test.js            # Bộ test Hardhat toàn diện (8+ test cases)
│
├── deployed-contract.json                   👉 [QUYỀN HẠN: LÂM] Lưu địa chỉ contract & abi sau deploy
├── hardhat.config.js                        👉 [QUYỀN HẠN: LÂM] Cấu hình Hardhat EVM Localhost
│
├── src/
│   ├── config/                              👉 [QUYỀN HẠN: THUẬN]
│   │   └── db.js                            # Kết nối SQLite, DDL khởi tạo các bảng & dữ liệu mẫu
│   │
│   ├── models/                              👉 [QUYỀN HẠN: THUẬN]
│   │   ├── Tree.js                          # Thao tác SQL bảng trees
│   │   ├── Incident.js                      # Thao tác SQL bảng incidents
│   │   └── CareRecord.js                    # Thao tác SQL bảng care_records
│   │
│   ├── controllers/                         👉 [QUYỀN HẠN: THUẬN]
│   │   ├── treeController.js                # Nghiệp vụ Cây xanh, tìm kiếm, xuất mã QR
│   │   ├── incidentController.js            # Nghiệp vụ tiếp nhận & điều phối sự cố
│   │   └── careController.js                # Nghiệp vụ nhật ký bảo dưỡng thực địa
│   │
│   ├── services/                            👉 [QUYỀN HẠN: LÂM]
│   │   ├── hashService.js                   # Thuật toán chuẩn hóa chuỗi và tính mã băm SHA-256
│   │   └── blockchainClient.js              # Khởi tạo Ethers.js kết nối ví & Smart Contract
│   │
│   ├── routes/
│   │   ├── treeRoutes.js                    👉 [QUYỀN HẠN: THUẬN] Router API Cây xanh & QR
│   │   ├── incidentRoutes.js                👉 [QUYỀN HẠN: THUẬN] Router API Sự cố
│   │   ├── careRoutes.js                    👉 [QUYỀN HẠN: THUẬN] Router API Chăm sóc
│   │   └── blockchainRoutes.js              👉 [QUYỀN HẠN: LÂM] Router API Neo dữ liệu & Verify
│   │
│   ├── registry.js                          👉 [QUYỀN HẠN: LÂM] Logic giao tiếp hợp đồng thông minh
│   └── server.js                            🔒 [DÙNG CHUNG: CHỈ MOUNT ROUTER - KHÔNG VIẾT LOGIC]
│
├── package.json                             🔒 [DÙNG CHUNG: KHÔNG GHI ĐÈ BỪA BÃI]
├── package-lock.json                        🔒 [DÙNG CHUNG: SINH TỰ ĐỘNG QUA NPM INSTALL]
└── urbantree.db                             ⚙️ [FILE CƠ SỞ DỮ LIỆU SQLITE - ĐÃ IGNORE TRÊN GIT]
```

---

## 🔐 2. TIÊU CHUẨN MẬT MÃ HỌC & BẢO CHỨNG BLOCKCHAIN (CRYPTOGRAPHIC SPEC)

Hệ thống UrbanTree sử dụng mô hình bảo chứng **Hybrid Architecture (Off-chain Data + On-chain Merkle/SHA-256 Anchor)**:
- Dữ liệu chi tiết (ảnh chụp, mô tả dài, thông tin người báo) được lưu trong **SQLite Off-chain** để tiết kiệm chi phí và tối ưu tốc độ đọc/ghi.
- Một chuỗi mã băm đại diện duy nhất (64 ký tự Hex SHA-256) được neo lên **Smart Contract On-chain**.

### 2.1. Quy tắc ghép chuỗi băm cho 3 loại bản ghi (Hashing Rules)
Để đảm bảo bên Thuận (DB) và bên Lâm (Blockchain) luôn tính ra mã băm trùng khớp 100% (Zero Mismatch), cả 2 bên **bắt buộc** áp dụng quy tắc ghép chuỗi nối bằng ký tự phân cách gạch đứng `|`:

#### A. Bản ghi Hồ sơ Cây xanh (`TREE_PROFILE`):
```javascript
// Cú pháp ghép chuỗi:
const rawTreeString = `${tree_code}|${species}|${location_name}|${latitude}|${longitude}|${planted_date}`;

// Ví dụ:
// "TREE-001|Cây Bàng Đài Loan|Công viên 23/9, Q.1, TP.HCM|10.7684|106.6934|2023-01-15"
// -> Hash SHA-256: 64 ký tự hex chữ thường
```

#### B. Bản ghi Nhật ký Chăm sóc (`CARE_LOG`):
```javascript
// Cú pháp ghép chuỗi:
const rawCareString = `${tree_id}|${caretaker_name}|${action_type}|${action_date}`;

// Ví dụ:
// "1|Đội Cơ Động 1|Cắt tỉa|2026-11-04 10:00:00"
```

#### C. Bản ghi Nghiệm thu Sự cố (`INCIDENT_REPORT`):
```javascript
// Cú pháp ghép chuỗi:
const rawIncidentString = `${incident_id}|${tree_id}|${severity}|${status}|${resolved_at}`;

// Ví dụ:
// "5|1|Khẩn cấp|Đã hoàn thành|2026-11-04 11:30:00"
```

---

## 🌳 3. ĐẶC TẢ CHI TIẾT 6 NHIỆM VỤ CỦA BẠN THUẬN (BACKEND & SQLITE)

### 📌 Nhiệm vụ THUAN-01: Tối ưu Cơ sở dữ liệu SQLite & DDL Schemas
- **File:** `backend/src/config/db.js`
- **Yêu cầu chi tiết:**
  - Kích hoạt chế độ Foreign Keys trong SQLite: `PRAGMA foreign_keys = ON;`.
  - Tạo bảng `trees` với đầy đủ các cột:
    ```sql
    CREATE TABLE IF NOT EXISTS trees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tree_code TEXT UNIQUE NOT NULL,
      species TEXT NOT NULL,
      location_name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      planted_date TEXT NOT NULL,
      health_status TEXT DEFAULT 'Tốt' CHECK(health_status IN ('Tốt', 'Bình thường', 'Cần chăm sóc', 'Sâu bệnh', 'Nguy hiểm')),
      qr_code_url TEXT,
      data_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_tree_code ON trees(tree_code);
    ```
  - Tạo bảng `incidents`:
    ```sql
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tree_id INTEGER,
      reporter_name TEXT NOT NULL,
      reporter_phone TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      severity TEXT DEFAULT 'Trung bình' CHECK(severity IN ('Thấp', 'Trung bình', 'Cao', 'Khẩn cấp')),
      status TEXT DEFAULT 'Chờ xử lý' CHECK(status IN ('Chờ xử lý', 'Đang xử lý', 'Đã hoàn thành', 'Từ chối')),
      reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE SET NULL
    );
    ```
  - Tạo bảng `care_records`:
    ```sql
    CREATE TABLE IF NOT EXISTS care_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tree_id INTEGER NOT NULL,
      caretaker_name TEXT NOT NULL,
      action_type TEXT NOT NULL CHECK(action_type IN ('Tưới nước', 'Bón phân', 'Cắt tỉa', 'Trị sâu bệnh', 'Gia cố cọc')),
      notes TEXT,
      action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE
    );
    ```

---

### 📌 Nhiệm vụ THUAN-02: Hoàn thiện Model & Controller Cây xanh (CRUD & GIS)
- **Files:** `backend/src/models/Tree.js`, `backend/src/controllers/treeController.js`
- **Chi tiết các hàm trong Model `Tree.js`:**
  - `getAll({ species, health_status, limit, offset }, callback)`: Hỗ trợ phân trang và bộ lọc linh hoạt.
  - `getById(id, callback)`: Tìm cây theo ID số.
  - `getByCode(tree_code, callback)`: Tìm cây theo mã QR `tree_code`.
  - `create(treeData, callback)`: Chèn bản ghi cây mới.
  - `update(id, treeData, callback)`: Cập nhật thông tin sinh thái của cây.
  - `updateHash(id, data_hash, callback)`: Cập nhật mã băm SHA-256 sau khi neo chuỗi.
  - `delete(id, callback)`: Xóa cây khỏi hệ thống.
  - `getNearby(lat, lng, radiusKm, callback)`: Lọc danh sách cây trong phạm vi bán kính (phục vụ bản đồ GIS A05).

---

### 📌 Nhiệm vụ THUAN-03: Tự động hóa Sinh mã QR & Xuất ảnh
- **File:** `backend/src/controllers/treeController.js`
- **Logic thực hiện:**
  - Sử dụng thư viện `qrcode`:
    ```javascript
    const QRCode = require('qrcode');
    ```
  - Khi người dùng gửi `POST /api/trees` tạo cây mới:
    1. Tự sinh nội dung QR chuẩn định dạng JSON:
       ```json
       {
         "app": "UrbanTree",
         "code": "TREE-001",
         "verifyUrl": "https://urbantree.hcm.gov.vn/verify/TREE-001"
       }
       ```
    2. Chuyển thành DataURL (Base64 PNG): `await QRCode.toDataURL(JSON.stringify(payload), { errorCorrectionLevel: 'H', width: 400 });`.
    3. Tự động lưu chuỗi Base64 này vào cột `qr_code_url` của bảng `trees`.
  - Viết endpoint `GET /api/trees/:id/qr`:
    - Trả về trực tiếp buffer hình ảnh PNG để ứng dụng Web/Mobile hiển thị hoặc in ấn nhãn kim loại.

---

### 📌 Nhiệm vụ THUAN-04: API Tiếp nhận Phản ánh Sự cố (Incident Management)
- **Files:** `backend/src/models/Incident.js`, `backend/src/controllers/incidentController.js`
- **Danh sách Endpoint:**
  1. `POST /api/incidents`: Người dân quét QR hoặc bật GPS gửi sự cố.
     - **Request Body:**
       ```json
       {
         "tree_id": 1,
         "reporter_name": "Trần Thị Mai",
         "reporter_phone": "0988776655",
         "description": "Cành sà sát lưới điện có tia lửa",
         "image_url": "https://img.urbantree.vn/inc-01.jpg",
         "severity": "Khẩn cấp"
       }
       ```
     - **Response:** HTTP 201 `{ success: true, message: "Tiếp nhận phản ánh thành công. Đội cứu hộ đang điều phối.", incident_id: 12 }`.
  2. `GET /api/incidents`: Quản trị viên lọc sự cố theo trạng thái (`?status=Chờ xử lý`).
  3. `PATCH /api/incidents/:id/status`:
     - **Request Body:** `{ "status": "Đã hoàn thành", "resolved_at": "2026-11-04 14:00:00" }`
     - **Xử lý:** Cập nhật DB và sẵn sàng để bên Blockchain đóng dấu nghiệm thu.

---

### 📌 Nhiệm vụ THUAN-05: API Quản lý Nhật ký Chăm sóc Thực địa (Care Records)
- **Files:** `backend/src/models/CareRecord.js`, `backend/src/controllers/careController.js`
- **Danh sách Endpoint:**
  1. `POST /api/care-records`: Nhân viên công viên quét QR cập nhật công việc vừa làm.
     - **Request Body:**
       ```json
       {
         "tree_id": 1,
         "caretaker_name": "Tổ Chăm Sóc 3 - Công viên 23/9",
         "action_type": "Cắt tỉa",
         "notes": "Hạ thấp độ cao 2m phòng chống giông bão tháng 11"
       }
       ```
     - **Response:** HTTP 201 `{ success: true, care_id: 45, message: "Đã lưu nhật ký bảo dưỡng thực địa" }`.
  2. `GET /api/care-records?tree_id=1`: Lấy toàn bộ lịch sử chăm sóc của một cây cụ thể để hiển thị lên dòng thời gian (Timeline M09 / A11).

---

### 📌 Nhiệm vụ THUAN-06: Tách File Routes & Chuẩn hóa Module
- **Yêu cầu:** Không để dồn tất cả routes vào 1 file `api.js` duy nhất nữa. Tách ra thành 3 file độc lập:
  - `backend/src/routes/treeRoutes.js`
  - `backend/src/routes/incidentRoutes.js`
  - `backend/src/routes/careRoutes.js`
- **Cách đăng ký vào `server.js`:**
  ```javascript
  const treeRoutes = require('./routes/treeRoutes');
  const incidentRoutes = require('./routes/incidentRoutes');
  const careRoutes = require('./routes/careRoutes');

  app.use('/api/trees', treeRoutes);
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/care-records', careRoutes);
  ```

---

## ⛓️ 4. ĐẶC TẢ CHI TIẾT 6 NHIỆM VỤ CỦA BẠN LÂM (BLOCKCHAIN & SECURITY)

### 📌 Nhiệm vụ LAM-01: Smart Contract `UrbanTreeRegistry.sol`
- **File:** `backend/contracts/UrbanTreeRegistry.sol`
- **Bản thiết kế cấu trúc Smart Contract chuẩn:**
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.20;

  contract UrbanTreeRegistry {
      struct Record {
          string recordId;       // Mã định danh (VD: "TREE-001", "CARE-45")
          string recordType;     // Loại bản ghi: "TREE_PROFILE", "CARE_LOG", "INCIDENT_REPORT"
          string dataHash;       // Mã băm SHA-256 (64 hex characters)
          uint256 timestamp;     // Thời điểm ghi bất biến trên blockchain
          address recorder;      // Địa chỉ ví người thực hiện giao dịch
          bool exists;           // Cờ đánh dấu đã tồn tại (chống ghi đè)
      }

      address public owner;
      mapping(address => bool) public authorizedRecorders;
      mapping(string => Record) private records;
      string[] private recordIds;

      event RecordAnchored(string indexed recordId, string recordType, string dataHash, uint256 timestamp, address indexed recorder);
      event RecorderAuthorized(address indexed account);
      event RecorderRevoked(address indexed account);

      modifier onlyOwner() {
          require(msg.sender == owner, "UrbanTree: Caller is not owner");
          _;
      }

      modifier onlyAuthorized() {
          require(msg.sender == owner || authorizedRecorders[msg.sender], "UrbanTree: Caller not authorized");
          _;
      }

      constructor() {
          owner = msg.sender;
      }

      function authorizeRecorder(address account) external onlyOwner {
          authorizedRecorders[account] = true;
          emit RecorderAuthorized(account);
      }

      function revokeRecorder(address account) external onlyOwner {
          authorizedRecorders[account] = false;
          emit RecorderRevoked(account);
      }

      function anchorRecord(string calldata recordId, string calldata recordType, string calldata dataHash) external onlyAuthorized {
          require(bytes(recordId).length > 0, "UrbanTree: Empty recordId");
          require(bytes(dataHash).length == 64, "UrbanTree: Invalid SHA-256 hash length");
          require(!records[recordId].exists, "UrbanTree: Record already anchored (Tampering prevented)");

          records[recordId] = Record(recordId, recordType, dataHash, block.timestamp, msg.sender, true);
          recordIds.push(recordId);

          emit RecordAnchored(recordId, recordType, dataHash, block.timestamp, msg.sender);
      }

      function verifyRecord(string calldata recordId, string calldata currentHash) external view returns (
          bool isValid,
          bool isExisted,
          uint256 timestamp,
          address recorder,
          string memory storedHash
      ) {
          Record memory rec = records[recordId];
          if (!rec.exists) {
              return (false, false, 0, address(0), "");
          }
          bool valid = (keccak256(bytes(rec.dataHash)) == keccak256(bytes(currentHash)));
          return (valid, true, rec.timestamp, rec.recorder, rec.dataHash);
      }

      function getRecord(string calldata recordId) external view returns (Record memory) {
          require(records[recordId].exists, "UrbanTree: Record not found");
          return records[recordId];
      }

      function getRecordCount() external view returns (uint256) {
          return recordIds.length;
      }

      function getAllRecordIds() external view returns (string[] memory) {
          return recordIds;
      }
  }
  ```

---

### 📌 Nhiệm vụ LAM-02: Bộ Kiểm thử Toàn diện Tự động (Hardhat Tests)
- **File:** `backend/test/UrbanTreeRegistry.test.js`
- **Bộ 8 kịch bản kiểm thử bắt buộc (Pass 100%):**
  1. `Test 1.1`: Deploy hợp đồng thành công và gán đúng quyền `owner`.
  2. `Test 1.2`: Owner cấp quyền cho ví nhân viên hiện trường `staffWallet`.
  3. `Test 1.3`: Chặn ví không có quyền (`unauthorizedWallet`) cố tình cấp quyền.
  4. `Test 2.1`: Nhân viên ghi dấu bản ghi hồ sơ cây (`anchorRecord`) thành công.
  5. `Test 2.2`: Hacker không có quyền ghi dấu bị chặn với revert message chính xác.
  6. `Test 2.3`: **CHỐNG GIAN LẬN HỒI TỐ:** Cố tình ghi đè lên mã cây đã tồn tại sẽ bị từ chối ngay lập tức.
  7. `Test 3.1`: **XÁC MINH HỢP LỆ (TÍCH XANH):** Gửi `currentHash` trùng khớp với hash trên chuỗi $\rightarrow$ Trả về `isValid = true`.
  8. `Test 3.2`: **PHÁT HIỆN GIAN LẬN (CẢNH BÁO ĐỎ):** Dữ liệu SQLite bị sửa đổi lén $\rightarrow$ Sinh ra hash khác $\rightarrow$ Trả về `isValid = false`.

---

### 📌 Nhiệm vụ LAM-03: Xây dựng Module Dịch vụ Băm (`hashService.js`)
- **File:** `backend/src/services/hashService.js`
- **Mã nguồn yêu cầu:**
  ```javascript
  const crypto = require('crypto');

  /**
   * Tính mã băm SHA-256 từ thông tin đối tượng cây xanh
   * @param {Object} tree { tree_code, species, location_name, latitude, longitude, planted_date }
   * @returns {string} Chuỗi mã băm 64 ký tự Hex
   */
  function hashTreeProfile(tree) {
      if (!tree || !tree.tree_code || !tree.species) {
          throw new Error("Dữ liệu cây không hợp lệ để tính mã băm");
      }
      const rawString = `${tree.tree_code}|${tree.species}|${tree.location_name}|${Number(tree.latitude)}|${Number(tree.longitude)}|${tree.planted_date}`;
      return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Tính mã băm SHA-256 cho nhật ký chăm sóc
   */
  function hashCareLog(care) {
      const rawString = `${care.tree_id}|${care.caretaker_name}|${care.action_type}|${care.action_date}`;
      return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  module.exports = {
      hashTreeProfile,
      hashCareLog
  };
  ```

---

### 📌 Nhiệm vụ LAM-04: Xây dựng Module Kết nối Blockchain (`blockchainClient.js`)
- **File:** `backend/src/services/blockchainClient.js`
- **Yêu cầu chi tiết:**
  - Khởi tạo `ethers.JsonRpcProvider('http://127.0.0.1:8545')`.
  - Quản lý ví Private Key an toàn từ biến môi trường `process.env.DEPLOYER_PRIVATE_KEY` (hoặc fallback ví mặc định của node dev).
  - Tự động nạp ABI và `contractAddress` từ file `deployed-contract.json`.
  - Cung cấp 2 hàm tiện ích bất đồng bộ:
    - `anchor(recordId, recordType, dataHash)`: Thực hiện ký và chờ xác nhận khối (Receipt confirmation).
    - `verify(recordId, currentHash)`: Gọi hàm view không tốn gas, trả về kết quả kiểm toán.

---

### 📌 Nhiệm vụ LAM-05: API Neo & Đối chiếu Xác minh (Registry Endpoints)
- **File:** `backend/src/routes/blockchainRoutes.js` (hoặc `backend/src/registry.js`)
- **Đặc tả Endpoints:**
  1. `POST /api/blockchain/anchor`:
     - **Request Body:** `{ "recordId": "TREE-001", "recordType": "TREE_PROFILE", "dataHash": "e3b0c44..." }`
     - **Response thành công:** `{ "status": "success", "txHash": "0x123...", "blockNumber": 104 }`
     - **Response lỗi:** HTTP 400 `{ "status": "error", "message": "Bản ghi đã tồn tại trên Blockchain hoặc ví không có quyền" }`
  2. `GET /api/blockchain/verify/:recordId`:
     - **Query Param:** `?currentHash=e3b0c44...`
     - **Response:**
       ```json
       {
         "recordId": "TREE-001",
         "isValid": true,
         "isExisted": true,
         "timestamp": 1730700000,
         "dateFormatted": "2026-11-04 10:30:00",
         "recorder": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
         "storedHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
         "currentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
         "auditStatus": "VERIFIED_INTEGRITY_MATCH"
       }
       ```
  3. `GET /api/blockchain/explorer`:
     - Trả về danh sách tất cả các bản ghi đã neo trên chuỗi để phục vụ màn hình **A18 Blockchain Activity Explorer**.

---

### 📌 Nhiệm vụ LAM-06: Tích hợp Đăng ký Router vào `server.js`
- **File:** `backend/src/server.js`
- **Cách gắn router:**
  ```javascript
  const blockchainRoutes = require('./routes/blockchainRoutes');
  app.use('/api/blockchain', blockchainRoutes);
  ```

---

## 🔄 5. KỊCH BẢN BẮT TAY END-TO-END (INTEGRATION SCENARIOS)

```
       BẠN THUẬN                                                   BẠN LÂM
(SQLite Database & APIs)                                  (Blockchain & Hash Engine)
           │                                                           │
           │  1. Nhận yêu cầu tạo cây mới                             │
           │  POST /api/trees                                         │
           │──────────────────────────────────────────────────────────>│
           │                                                           │  2. Tính SHA-256
           │                                                           │  hashTreeProfile()
           │                                                           │  3. Gửi transaction
           │                                                           │  anchorRecord() lên chuỗi
           │  4. Trả về txHash & dataHash                              │
           │<──────────────────────────────────────────────────────────│
           │  5. Lưu data_hash vào bảng trees                          │
           │  6. Xuất mã QR cho cây                                    │
           │                                                           │
           │                                                           │
 [Người dân / Thanh tra quét QR]                                       │
           │  7. Gọi GET /api/blockchain/verify/TREE-001               │
           │     kèm hash đọc từ SQLite                                │
           │──────────────────────────────────────────────────────────>│
           │                                                           │  8. Smart contract đối chiếu
           │                                                           │  isValid = (dbHash == chainHash)
           │  9. Hiển thị tích xanh bảo chứng toàn vẹn                 │
           │<──────────────────────────────────────────────────────────│
```

---

## 🛠️ 6. BỘ LỆNH CHUẨN XÁC DÀNH CHO CON CHAT ĐIỀU HÀNH GIT

Để đảm bảo con chat của cả hai bạn không gây conflict khi push code:

### Đối với AI của Bạn Thuận:
```powershell
# 1. Luôn đồng bộ main trước
git checkout main
git pull origin main

# 2. Tạo nhánh làm việc
git checkout -b feature/thuan-tree-crud

# 3. CHỈ ADD CÁC FILE THUỘC QUYỀN HẠN CỦA MÌNH
git add backend/src/config/db.js backend/src/models/ backend/src/controllers/ backend/src/routes/treeRoutes.js backend/src/routes/incidentRoutes.js backend/src/routes/careRoutes.js

# 4. Commit chuẩn conventional
git commit -m "feat(api): implement tree crud, qr generator and care endpoints"

# 5. Push lên GitHub
git push -u origin feature/thuan-tree-crud
```

### Đối với AI của Bạn Lâm:
```powershell
# 1. Luôn đồng bộ main trước
git checkout main
git pull origin main

# 2. Tạo nhánh làm việc
git checkout -b feature/lam-blockchain-service

# 3. CHỈ ADD CÁC FILE THUỘC QUYỀN HẠN CỦA MÌNH
git add backend/contracts/ backend/test/ backend/scripts/ backend/src/services/ backend/src/routes/blockchainRoutes.js backend/src/registry.js

# 4. Commit chuẩn conventional
git commit -m "feat(blockchain): implement hash service, anchor and verify gate endpoints"

# 5. Push lên GitHub
git push -u origin feature/lam-blockchain-service
```

---

## 🏁 BẢNG TỔNG KẾT TIÊU CHÍ NGHIỆM THU ĐỒ ÁN (ACCEPTANCE CHECKLIST)

| Hạng mục | Tiêu chí đạt | Người nghiệm thu |
|:---|:---|:---:|
| **Cơ sở dữ liệu SQLite** | 3 bảng tạo chuẩn, quan hệ Foreign Key chuẩn, tự động chèn 3 cây xanh mẫu | Bạn Thuận |
| **API Cây xanh & QR** | CRUD hoạt động trơn tru, sinh QR Base64 xem được trên trình duyệt | Bạn Thuận |
| **API Sự cố & Chăm sóc** | Báo sự cố thành công, cập nhật trạng thái xử lý và lưu nhật ký | Bạn Thuận |
| **Smart Contract** | 8/8 test Hardhat passed, chống ghi đè thành công, chặn truy cập trái phép | Bạn Lâm |
| **Mật mã học SHA-256** | Hàm băm đồng nhất cho cả DB và Smart Contract, không lệch dù chỉ 1 ký tự | Bạn Lâm |
| **Cổng Xác thực A19** | Trả về `isValid: true` khi dữ liệu chuẩn và `isValid: false` khi dữ liệu bị sửa lén | Cả 2 cùng test |

---
*Tài liệu này là quy chuẩn kỹ thuật độc quyền của nhóm Đồ án UrbanTree. Mọi AI Agent tham gia dự án phải tuyệt đối tuân thủ theo chỉ dẫn này.*

## 🚀 7. ĐẶC TẢ PHÂN CÔNG & QUY TRÌNH GIT NÂNG CẤP ĐỒ ÁN 4 (4 MODULE MỞ RỘNG)

Để nâng cấp dự án UrbanTree từ mức MVP lên chuẩn **Đồ Án 4 (Đồ án tốt nghiệp / chuyên sâu)**, hai thành viên triển khai toàn diện 4 module nâng cấp:
- **Module 1**: Ứng dụng Di động Flutter đa nền tảng (iOS & Android).
- **Module 2**: Hệ thống Xác thực Bảo mật cao cấp (Google OAuth 2.0 + OTP Email 6 số + JWT Refresh).
- **Module 3**: Hệ thống Trí tuệ Nhân tạo 4 Engine phân tích cây trồng (Gemini AI).
- **Module 4**: Nâng cấp Giao diện Admin Web, Dashboard phân tích rủi ro & Hệ thống cảnh báo thời gian thực.

---

### 7.1. Bổ sung ma trận phân quyền thư mục & file mới

```
d:\TQLCNTT2311074\Nam4HK1\UrbunTree\
│
├── mobile/                                  👉 [QUYỀN HẠN: LÂM (UI/UX) + THUẬN (API/Data)]
│   ├── lib/
│   │   ├── core/                            # Theme, constants, network client
│   │   ├── features/
│   │   │   ├── auth/                        # Màn hình Login, Google Sign-In, OTP [LÂM/THUẬN]
│   │   │   ├── tree/                        # Danh sách, chi tiết cây, hồ sơ sinh thái [LÂM]
│   │   │   ├── qr_scanner/                  # Native camera quét mã QR [LÂM]
│   │   │   ├── map/                         # Google Maps định vị cây xanh [LÂM]
│   │   │   ├── ai_analysis/                 # Hiển thị điểm sức khỏe, cảnh báo ngã đổ, phác đồ [LÂM]
│   │   │   ├── care/                        # Ghi nhận chăm sóc thực địa, ảnh chụp [LÂM]
│   │   │   └── incident/                    # Báo cáo sự cố người dân, định vị GPS [LÂM]
│   │   └── data/                            # Models, Repositories, Providers [THUẬN]
│   ├── pubspec.yaml                         🔒 [DÙNG CHUNG: KHÔNG XUNG ĐỘT DEPENDENCY]
│   └── README.md
│
├── backend/src/
│   ├── services/
│   │   ├── geminiAiService.js               👉 [QUYỀN HẠN: LÂM] 4 AI Engines gọi Gemini API
│   │   ├── otpService.js                    👉 [QUYỀN HẠN: THUẬN] Sinh mã OTP, gửi Email Nodemailer
│   │   └── googleAuthService.js             👉 [QUYỀN HẠN: THUẬN] Verify Google ID Token
│   │
│   ├── controllers/
│   │   ├── authController.js                👉 [QUYỀN HẠN: THUẬN] Logic Google Sign-In, Request/Verify OTP
│   │   └── aiController.js                  👉 [QUYỀN HẠN: LÂM] Phân tích sức khỏe, khí hậu, dự đoán ngã đổ
│   │
│   └── routes/
│       ├── authRoutes.js                    👉 [QUYỀN HẠN: THUẬN] Router /api/v1/auth/*
│       └── aiRoutes.js                      👉 [QUYỀN HẠN: LÂM] Router /api/v1/ai/*
```

---

### 7.2. Chi tiết phân công 4 Module Nâng cấp

#### 👨‍💻 BẠN ĐOÀN THẾ THUẬN (Backend, Authentication & Data Layer)
1. **Nhiệm vụ THUAN-ADV-01: Hệ thống Xác thực Google Sign-In & OTP:**
   - Cài đặt và cấu hình thư viện `google-auth-library`, `nodemailer`.
   - Viết controller xử lý `POST /api/v1/auth/google`: nhận token từ client, xác thực danh tính, tự động lưu thông tin user.
   - Viết controller xử lý `POST /api/v1/auth/request-otp` và `POST /api/v1/auth/verify-otp`: sinh mã 6 số ngẫu nhiên, hạn dùng 5 phút, gửi email định dạng HTML chuyên nghiệp.
   - Quản lý JWT Token: sinh cặp `accessToken` (15 phút) và `refreshToken` (7 ngày), middleware kiểm tra quyền hạn chặt chẽ.
2. **Nhiệm vụ THUAN-ADV-02: Nâng cấp Cơ sở dữ liệu cho AI & Auth:**
   - Bổ sung bảng `users` (id, email, full_name, avatar, role, auth_provider, created_at).
   - Bổ sung bảng `otp_requests` (id, email, otp_code, expires_at, is_used).
   - Bổ sung bảng `ai_risk_logs` (id, tree_id, risk_score, risk_level, fall_probability, recommendations, created_at) để lưu lại các phân tích phục vụ tra cứu lịch sử.
3. **Nhiệm vụ THUAN-ADV-03: Xây dựng Data Layer cho Mobile Flutter:**
   - Xây dựng các lớp Model (fromJSON / toJSON) trên Flutter: `UserModel`, `TreeModel`, `AiHealthModel`, `RiskPredictionModel`.
   - Cấu hình thư viện `dio` với Interceptor tự động gắn JWT Token và bắt lỗi kết nối.

#### 👨‍💻 BẠN TRẦN QUANG LÂM (AI Engines, Flutter UI/UX & Blockchain Expansion)
1. **Nhiệm vụ LAM-ADV-01: Triển khai 4 Engine AI thông minh bằng Gemini API:**
   - Tích hợp `@google/genai` với API Key được cấp, xây dựng `geminiAiService.js`:
     - **Engine 1 - TreeHealth AI (`GET /api/v1/ai/trees/:id/health`)**: Phân tích dữ liệu chăm sóc và tuổi cây, tính điểm sức khỏe từ 0-100 (Grade A+ đến F).
     - **Engine 2 - ClimateMatch AI (`POST /api/v1/ai/climate-match`)**: Phân tích tọa độ, lượng mưa, khí hậu TP.HCM / nhiệt đới gió mùa để gợi ý top 5 loài cây tối ưu.
     - **Engine 3 - RiskPredict AI (`GET /api/v1/ai/trees/:id/risk`)**: Dự báo xác suất ngã đổ (%) dựa trên tuổi cây > 20 năm, giông bão, tần suất sự cố, trả về mức độ cảnh báo (Thấp / Trung bình / Cao / Khẩn cấp).
     - **Engine 4 - CareAdvisor AI (`GET /api/v1/ai/trees/:id/care-plan`)**: Sinh phác đồ điều trị 3 giai đoạn (Khẩn cấp, Dinh dưỡng, Phục hồi) kèm ước lượng chi phí.
2. **Nhiệm vụ LAM-ADV-02: Phát triển Ứng dụng Di động Flutter:**
   - Khởi tạo dự án Flutter (Flutter 3.47+, Dart 3.13+), thiết lập theme màu sinh thái Verdant `#174B36`, `#347A50`, font chữ Inter/Roboto.
   - Xây dựng màn hình:
     - `LoginScreen` & `OtpVerificationScreen`: Đăng nhập Google 1 chạm và nhập mã xác thực OTP.
     - `DashboardScreen`: Thống kê tổng số cây, số lượng cảnh báo ngã đổ đỏ/cam, tác vụ cần xử lý.
     - `QrScannerScreen`: Mở camera quét mã nhãn cây tốc độ cao, điều hướng ngay tới chi tiết cây.
     - `TreeDetailScreen` & `AiAnalysisScreen`: Hiển thị thông tin sinh thái, biểu đồ sức khỏe AI, huy hiệu rủi ro ngã đổ, khuyến nghị của CareAdvisor.
     - `MapScreen`: Bản đồ Google Maps định vị cây xung quanh, lọc theo mức độ rủi ro hoặc tình trạng sức khỏe.
3. **Nhiệm vụ LAM-ADV-03: Neo Bảo chứng Báo cáo AI lên Blockchain:**
   - Mở rộng hàm băm `hashAiRiskReport(report)` để tạo mã SHA-256 từ kết quả cảnh báo rủi ro ngã đổ.
   - Neo mã băm của các cảnh báo rủi ro mức độ "Khẩn cấp" lên Smart Contract `UrbanTreeRegistry.sol`, đảm bảo các dữ liệu kiểm định an toàn cây xanh không thể bị xóa hoặc thay đổi lén sau khi xảy ra sự cố thiên tai.

---

### 7.3. Quy trình nhánh Git & Phối hợp Nâng cấp

| Nhánh Git | Phạm vi công việc | Người phụ trách |
|---|---|:---:|
| `feature/thuan-auth-google-otp` | Google OAuth, OTP service, bảng users/otp, middleware JWT | Bạn Thuận |
| `feature/lam-gemini-ai-engines` | 4 AI Engines, routes AI, prompt engineering, AI unit tests | Bạn Lâm |
| `feature/lam-flutter-ui` | UI Flutter: Auth, Dashboard, QR Scanner, Maps, AI Cards | Bạn Lâm |
| `feature/thuan-flutter-data` | Data Layer Flutter: Dio client, repositories, models | Bạn Thuận |
| `feature/lam-blockchain-ai-anchor` | Hash và neo bản ghi AI risk report lên Smart Contract | Bạn Lâm |

**Quy tắc Git bất biến:**
```powershell
# 1. Luôn rebase từ main mới nhất
git checkout main
git pull origin main

# 2. Tạo nhánh làm việc theo phân công
git checkout -b feature/<ten-nhanh>

# 3. Chỉ commit file thuộc quyền hạn được chỉ định tại mục 7.1
git add <duong-dan-file>
git commit -m "feat(ai): integrate gemini 4-engine analysis service"

# 4. Push và tạo PR để người còn lại review
git push -u origin feature/<ten-nhanh>
```

---

## 🏁 BẢNG TỔNG KẾT TIÊU CHÍ NGHIỆM THU ĐỒ ÁN 4 NÂNG CAO

| Hạng mục | Tiêu chí đạt chuẩn Đồ Án 4 | Người nghiệm thu |
|:---|:---|:---:|
| **Xác thực Google & OTP** | Đăng nhập Google thành công, mã OTP 6 số gửi về email và xác thực trong 5 phút | Bạn Thuận |
| **Bảo mật JWT** | Token hết hạn tự refresh mượt mà, phân quyền Admin / Staff chặt chẽ | Bạn Thuận |
| **AI TreeHealth & RiskPredict** | Trả về điểm sức khỏe 0-100, xác suất ngã đổ và mức cảnh báo chính xác theo dữ liệu đầu vào | Bạn Lâm |
| **AI ClimateMatch & CareAdvisor** | Đưa ra top 5 loài cây phù hợp khí hậu TP.HCM và phác đồ điều trị 3 giai đoạn chi tiết | Bạn Lâm |
| **Ứng dụng Mobile Flutter** | Chạy mượt mà trên iOS/Android giả lập/máy thật, quét QR camera nhạy, Google Maps mượt | Cả 2 cùng test |
| **Bảo chứng AI trên Blockchain** | Cảnh báo ngã đổ nguy cấp được băm SHA-256 và neo lên Smart Contract, verify tích xanh A19 | Bạn Lâm |
| **Kịch bản Demo Tốt nghiệp** | Demo thông suốt 10-12 phút bao gồm: Web Admin, Flutter App, Quét QR, Báo cáo AI, Đối chiếu Blockchain | Cả 2 cùng diễn tập |

---
*Tài liệu phân công kỹ thuật được cập nhật hoàn thiện dành riêng cho Đồ Án 4 UrbanTree.*
