# 📋 BẢNG PHÂN CÔNG NHIỆM VỤ & QUY TRÌNH LÀM VIỆC GIT
## DỰ ÁN: URBANTREE — HỆ THỐNG QUẢN LÝ CÂY XANH ĐÔ THỊ (QR & BLOCKCHAIN)

> **Mục tiêu:** Phân chia rõ ràng phạm vi công việc, quyền sở hữu file và quy trình phối hợp Git giữa 2 thành viên để làm việc song song hiệu quả, **tuyệt đối không bị xung đột code (Merge Conflict)**.

---

## 👥 1. THÀNH VIÊN VÀ VAI TRÒ CHÍNH

| STT | Thành viên | MSSV | Vai trò chính | Trọng tâm công nghệ |
|:---:|:---|:---:|:---|:---|
| **1** | **Trần Quang Lâm** | 2311074 | **Blockchain & Security Engineer** | Solidity, Hardhat, Ethers.js, SHA-256 Hashing, Smart Contract Testing, Cổng A18/A19 Verify |
| **2** | **Đặng Thế Thuận** | 2311031 | **Backend & Database Engineer** | Node.js, Express, SQLite, RESTful API, QR Code Generator, Quản lý Cây & Sự cố & Chăm sóc |

---

## 📁 2. MA TRẬN PHÂN CHIA QUYỀN SỞ HỮU FILE (FILE OWNERSHIP)

Để không bao giờ bị conflict, **nguyên tắc vàng:** Mỗi người chỉ làm việc trong file/thư mục được phân quyền của mình.

```
backend/
├── contracts/                  👉 [LÂM TOÀN QUYỀN] Smart contract Solidity
├── test/                       👉 [LÂM TOÀN QUYỀN] Test smart contract bằng Hardhat
├── scripts/                    👉 [LÂM TOÀN QUYỀN] Script deploy smart contract
├── deployed-contract.json      👉 [LÂM TOÀN QUYỀN] Địa chỉ contract sau khi deploy
│
├── src/
│   ├── config/                 👉 [THUẬN TOÀN QUYỀN] Cấu hình SQLite, bảng trees, incidents, care_records
│   ├── models/                 👉 [THUẬN TOÀN QUYỀN] Tree.js, Incident.js, CareRecord.js
│   ├── controllers/            👉 [THUẬN TOÀN QUYỀN] treeController.js, incidentController.js, careController.js
│   │
│   ├── routes/
│   │   ├── treeRoutes.js       👉 [THUẬN TOÀN QUYỀN] Route cây xanh & QR
│   │   ├── incidentRoutes.js   👉 [THUẬN TOÀN QUYỀN] Route phản ánh sự cố
│   │   ├── careRoutes.js       👉 [THUẬN TOÀN QUYỀN] Route bảo dưỡng chăm sóc
│   │   └── blockchainRoutes.js 👉 [LÂM TOÀN QUYỀN] Route ghi dấu (/record) & xác thực (/verify)
│   │
│   ├── services/
│   │   ├── hashService.js      👉 [LÂM TOÀN QUYỀN] Hàm băm SHA-256 dữ liệu cây
│   │   └── blockchainClient.js 👉 [LÂM TOÀN QUYỀN] Kết nối ví deployer & Smart contract
│   │
│   └── server.js               🔒 [FILE DÙNG CHUNG - ĐỌC QUY TẮC MỤC 4]
│
├── package.json                🔒 [FILE DÙNG CHUNG - ĐỌC QUY TẮC MỤC 4]
└── package-lock.json           🔒 [TỰ ĐỘNG SINH BỞI NPM]
```

---

## 📝 3. BẢNG CHI TIẾT NHIỆM VỤ TỪNG NGƯỜI

### 🌳 NGƯỜI 2: ĐẶNG THẾ THUẬN (Backend, Database & Nghiệp vụ Quản lý)

| Mã NV | Công việc chi tiết | File phụ trách | Trạng thái / Đầu ra |
|:---:|:---|:---|:---|
| **THUAN-01** | **Hoàn thiện Database SQLite:** Thiết kế schema bảng `trees`, `incidents`, `care_records`. Thêm index cho `tree_code`. | `backend/src/config/db.js` | Đã xong khung cơ bản, cần bổ sung ràng buộc dữ liệu |
| **THUAN-02** | **Quản lý Cây xanh (CRUD Tree):** Viết đầy đủ API lấy danh sách, lọc theo loài/quận, tìm theo tọa độ GPS gần nhất, sửa, xóa cây. | `models/Tree.js`<br>`controllers/treeController.js` | Endpoint `/api/trees` |
| **THUAN-03** | **Tạo và Quản lý QR Code:** Sinh mã QR chứa link hoặc dữ liệu định danh cây, lưu Base64 hoặc xuất ảnh PNG cho in ấn thẻ nhôm ngoài trời (A10). | `controllers/treeController.js` | Endpoint `/api/trees/:id/qr` |
| **THUAN-04** | **Quản lý Sự cố Cây xanh (Incident Center):** API gửi phản ánh sự cố (kèm ảnh, vị trí, người báo) và cập nhật tiến độ xử lý của đội cứu hộ (A14/A15). | `models/Incident.js`<br>`controllers/incidentController.js` | Endpoint `/api/incidents` |
| **THUAN-05** | **Nhật ký Chăm sóc Thực địa (Care Records):** API ghi nhận lịch sử tưới nước, bón phân, tỉa cành do nhân viên hiện trường nộp lên (A11/A12). | `models/CareRecord.js`<br>`controllers/careController.js` | Endpoint `/api/care-records` |
| **THUAN-06** | **Tách Route độc lập:** Tách nhỏ file `api.js` thành các file route riêng (`treeRoutes.js`, `incidentRoutes.js`, `careRoutes.js`) để tránh đụng file với Lâm. | `src/routes/*` | Tách file sạch sẽ, modular hóa code |

---

### ⛓️ NGƯỜI 1: TRẦN QUANG LÂM (Smart Contract, Hash SHA-256 & Xác thực Toàn vẹn)

| Mã NV | Công việc chi tiết | File phụ trách | Trạng thái / Đầu ra |
|:---:|:---|:---|:---|
| **LAM-01** | **Smart Contract UrbanTreeRegistry:** Hợp đồng lưu trữ bản ghi bất biến, phân quyền ví nhân viên ghi dữ liệu (`authorizeRecorder`), chống ghi đè hồ sơ. | `contracts/UrbanTreeRegistry.sol` | Đã hoàn thành & test pass 100% |
| **LAM-02** | **Bộ Test Tự động Hardhat (Zero Bug):** Viết test phân quyền, test ghi dấu cây, test chống hack và test đối chiếu mã băm (isValid true/false). | `test/UrbanTreeRegistry.test.js` | 8/8 test PASSED |
| **LAM-03** | **Script Deploy & Node Mạng nội bộ:** Script deploy tự động xuất ra `deployed-contract.json` chứa địa chỉ hợp đồng mới nhất. | `scripts/deploy.js` | Đã cấu hình cho Localhost node |
| **LAM-04** | **Thuật toán Băm Chuẩn hóa (Data Hashing):** Viết module tính toán chuỗi mã băm SHA-256 từ thông tin cây (tree_code + species + planted_date + coords). | `src/services/hashService.js` | Đảm bảo tính toán đồng nhất giữa DB và chuỗi |
| **LAM-05** | **API Đóng dấu Lên Chuỗi (Anchor to Chain):** Nhận sự kiện từ DB khi cây mới được tạo, tự động ký giao dịch và lưu `dataHash` lên Blockchain. | `src/registry.js` hoặc `routes/blockchainRoutes.js` | Endpoint `POST /api/record` |
| **LAM-06** | **Cổng Tra cứu & Xác minh Toàn vẹn (A18/A19):** API đối chiếu hash thực tế trong DB với hash lưu trên hợp đồng để phát hiện giả mạo dữ liệu (Zero Mismatch). | `src/registry.js` | Endpoint `GET /api/verify/:id` |

---

## 🤝 4. ĐIỂM BẮT TAY (INTEGRATION HANDSHAKE) GIỮA THUẬN VÀ LÂM

Để 2 hệ thống khớp nối mượt mà như 1 thể thống nhất:

```
[Người dân / Admin / Staff]
          │
          ▼
   [Express API Server]
          │
   ┌──────┴─────────────────────────────────┐
   ▼                                        ▼
[Phần Bạn Thuận]                      [Phần Bạn Lâm]
1. Nhận thông tin cây               1. Nhận data cây từ Thuận
2. Lưu vào SQLite (urbantree.db)    2. Tính SHA-256 Hash
3. Trả về thông tin + QR Code       3. Gửi transaction lên Hardhat Node
                                    4. Cập nhật data_hash vào bảng trees
```

### Quy ước Payload API đối chiếu (Verify):
- Khi gọi `GET /api/verify/:tree_id`:
  - **Hệ thống sẽ:**
    1. Lấy dữ liệu cây từ SQLite của Thuận $\rightarrow$ Tính mã băm hiện tại `currentHash`.
    2. Đọc mã băm gốc được neo trên Blockchain của Lâm `storedHash`.
    3. So sánh:
       - Nếu `currentHash === storedHash`: Trả về `isValid: true` (Tích xanh uy tín).
       - Nếu `currentHash !== storedHash`: Trả về `isValid: false` (Cảnh báo đỏ đã bị sửa lén trong DB).

---

## 🔒 5. QUY TẮC XỬ LÝ 2 FILE DÙNG CHUNG

### 1. File `backend/package.json`:
- **Quy tắc:** Khi muốn cài thêm thư viện npm mới:
  - Nhắn tin thông báo cho người kia biết trước: *"Tớ cài thêm thư viện X nhé"*.
  - Chạy `npm install <tên-thư-viện>` trong thư mục `backend`.
  - Push commit riêng cho việc thêm thư viện trước khi code tính năng.

### 2. File `backend/src/server.js`:
- **Quy tắc:** Không viết logic code trực tiếp vào `server.js`.
- `server.js` chỉ làm nhiệm vụ nạp Express và đăng ký các Router:
  ```javascript
  // Thuận đăng ký router của Thuận
  app.use('/api', treeRoutes);
  app.use('/api', incidentRoutes);
  app.use('/api', careRoutes);

  // Lâm đăng ký router của Lâm
  app.use('/api', blockchainRoutes);
  ```

---

## 🚀 6. QUY TRÌNH GIT CHUẨN ĐỂ KHÔNG BAO GIỜ BỊ CONFLICT

### 🛑 Bước 0: Nguyên tắc Vàng
- **KHÔNG BAO GIỜ code trực tiếp trên nhánh `main`**.
- Mọi người đều tạo nhánh riêng từ `main` mới nhất để làm việc.

---

### 💻 Quy trình làm việc hàng ngày (Daily Workflow):

#### 1. Trước khi bắt đầu code mỗi ngày (Cập nhật code mới nhất từ bạn mình):
```powershell
git checkout main
git pull origin main
```

#### 2. Tạo nhánh làm việc cho tính năng mới:
- Quy ước đặt tên nhánh:
  - Bạn Thuận: `feature/thuan-<tên-chức-năng>` (VD: `feature/thuan-crud-tree`)
  - Bạn Lâm: `feature/lam-<tên-chức-năng>` (VD: `feature/lam-hash-verify`)

```powershell
git checkout -b feature/lam-hash-verify
```

#### 3. Sau khi hoàn thành và test chạy tốt:
```powershell
# Xem lại các file mình đã sửa xem có sửa nhầm file của bạn không
git status

# Add và commit
git add .
git commit -m "feat(blockchain): implement sha256 hash service for trees"

# Đẩy nhánh của mình lên GitHub
git push -u origin feature/lam-hash-verify
```

#### 4. Gộp code vào `main` (Chuẩn chuyên nghiệp):
1. Lên trang GitHub dự án: `https://github.com/tranquanglam123tv-cyber/UrbanTree`
2. Tạo **Pull Request (PR)** từ nhánh của bạn vào `main`.
3. Nhắn bạn cùng nhóm bấm **Review** và **Merge**.
4. Sau khi merge xong, cả 2 quay lại terminal gõ `git checkout main && git pull origin main` để cùng sở hữu code mới nhất!

---

*Tài liệu này được tạo tự động để phục vụ Đồ án 4 — Hệ thống Quản lý Cây xanh Đô thị UrbanTree.*
