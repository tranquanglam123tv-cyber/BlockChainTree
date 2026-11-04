# 🤖 BẢNG PHÂN CÔNG NHIỆM VỤ & ĐẶC TẢ KỸ THUẬT CHO AI AGENT
## DỰ ÁN: URBANTREE — HỆ THỐNG QUẢN LÝ CÂY XANH ĐÔ THỊ (QR & BLOCKCHAIN)

> ⚠️ **HƯỚNG DẪN DÀNH CHO CON CHAT / AI AGENT KHI ĐỌC TÀI LIỆU NÀY:**
> 1. Xác định bạn đang thực hiện tác vụ cho **BẠN THUẬN (Backend SQLite)** hay **BẠN LÂM (Blockchain Smart Contract)**.
> 2. **Tuyệt đối không chỉnh sửa (DO NOT MODIFY)** các file nằm ngoài phạm vi phân quyền của người đó.
> 3. Tuân thủ chính xác 100% các định dạng JSON Request/Response, quy tắc băm SHA-256 và chữ ký hàm bên dưới.
> 4. Sau khi viết code xong, bắt buộc chạy câu lệnh kiểm thử (Acceptance Test Command) tương ứng trước khi báo hoàn thành.

---

## 👥 1. PHÂN CHIA VAI TRÒ & PHẠM VI QUYỀN HẠN (STRICT BOUNDARIES)

| Người thực hiện | Vai trò | Thư mục & File TOÀN QUYỀN sửa đổi | Thư mục & File TUYỆT ĐỐI KHÔNG CHẠM |
|:---|:---|:---|:---|
| **BẠN THUẬN**<br>`(thethuan)` | **Backend & SQLite Database** | • `backend/src/config/db.js`<br>• `backend/src/models/*`<br>• `backend/src/controllers/*`<br>• `backend/src/routes/treeRoutes.js`<br>• `backend/src/routes/incidentRoutes.js`<br>• `backend/src/routes/careRoutes.js` | ❌ `backend/contracts/*`<br>❌ `backend/test/*`<br>❌ `backend/scripts/*`<br>❌ `backend/src/registry.js`<br>❌ `backend/src/services/*` |
| **BẠN LÂM**<br>`(tranquanglam)` | **Blockchain & Security** | • `backend/contracts/*`<br>• `backend/test/*`<br>• `backend/scripts/*`<br>• `backend/src/registry.js`<br>• `backend/src/services/*`<br>• `backend/src/routes/blockchainRoutes.js` | ❌ `backend/src/config/db.js`<br>❌ `backend/src/models/*`<br>❌ `backend/src/controllers/*` |

> 🔒 **CÁC FILE DÙNG CHUNG (`backend/package.json`, `backend/src/server.js`):**
> - Không AI Agent nào được tự ý xóa hoặc ghi đè toàn bộ file.
> - Khi mount route vào `server.js`, chỉ chèn đúng dòng `app.use(...)` phụ trách của mình.

---

## 🔐 2. ĐẶC TẢ THUẬT TOÁN BĂM DỮ LIỆU CHUNG (DATA HASHING STANDARD)

> ⭐️ **QUY TẮC CỐT LÕI ĐỂ BẮT TAY KHÔNG BỊ LỆCH MÃ BĂM (ZERO MISMATCH):**  
> Cả AI của Thuận và AI của Lâm phải dùng chung một định dạng chuỗi trước khi băm SHA-256.

```javascript
// Chuỗi chuẩn hóa trước khi băm:
const rawDataString = `${tree_code}|${species}|${location_name}|${latitude}|${longitude}|${planted_date}`;

// Thuật toán băm: SHA-256 xuất ra 64 ký tự Hex chữ thường
const dataHash = crypto.createHash('sha256').update(rawDataString).digest('hex');
```

- **Ví dụ mẫu:**
  - `rawDataString`: `TREE-001|Cây Bàng Đài Loan|Công viên 23/9, Q.1, TP.HCM|10.7684|106.6934|2023-01-15`
  - `dataHash`: chuỗi 64 ký tự hex đại diện cho hồ sơ gốc trên chuỗi khối.

---

## 📋 3. CHI TIẾT NHIỆM VỤ DÀNH CHO AI CỦA BẠN THUẬN (BACKEND & SQLITE)

### 📌 Task `THUAN-01`: Cấu trúc Database SQLite chuẩn
- **File:** `backend/src/config/db.js`
- **Yêu cầu triển khai:**
  - Bảng `trees`: `id`, `tree_code` (UNIQUE), `species`, `location_name`, `latitude`, `longitude`, `planted_date`, `health_status`, `qr_code_url`, `data_hash`, `created_at`, `updated_at`.
  - Bảng `incidents`: `id`, `tree_id`, `reporter_name`, `reporter_phone`, `description`, `image_url`, `severity` (Thấp/Trung bình/Cao/Khẩn cấp), `status` (Chờ xử lý/Đang xử lý/Đã hoàn thành), `reported_at`.
  - Bảng `care_records`: `id`, `tree_id`, `caretaker_name`, `action_type` (Tưới nước/Bón phân/Cắt tỉa/Trị sâu bệnh), `notes`, `action_date`.

### 📌 Task `THUAN-02`: API Quản lý Cây xanh (CRUD Tree)
- **Files:** `backend/src/models/Tree.js`, `backend/src/controllers/treeController.js`, `backend/src/routes/treeRoutes.js`
- **Đặc tả Endpoints:**
  1. `GET /api/trees` — Lấy danh sách cây (hỗ trợ query param `?species=...&status=...`).
     - **Response:** `{ success: true, count: number, data: [...] }`
  2. `GET /api/trees/:id` — Lấy chi tiết cây theo `id` hoặc `tree_code`.
     - **Response:** `{ success: true, data: { ... } }` (404 nếu không tìm thấy).
  3. `POST /api/trees` — Thêm cây xanh mới.
     - **Body:** `{ "tree_code": "TREE-004", "species": "Cây Sao Đen", "location_name": "Đường Lê Duẩn, Q.1", "latitude": 10.7801, "longitude": 106.6992, "planted_date": "2024-02-10", "health_status": "Tốt" }`
     - **Xử lý:** Tự động gọi thư viện `qrcode` để sinh mã QR Base64 lưu vào trường `qr_code_url`.
     - **Response:** `{ success: true, message: "Thêm cây xanh thành công", data: { id, ... } }` (Status 201).
  4. `PUT /api/trees/:id` — Cập nhật thông tin cây.
  5. `DELETE /api/trees/:id` — Xóa cây xanh.

### 📌 Task `THUAN-03`: API Tiếp nhận Sự cố Cây xanh (Incidents)
- **Files:** `backend/src/models/Incident.js`, `backend/src/controllers/incidentController.js`, `backend/src/routes/incidentRoutes.js`
- **Đặc tả Endpoints:**
  1. `GET /api/incidents` — Lấy danh sách toàn bộ phản ánh sự cố.
  2. `POST /api/incidents` — Người dân / nhân viên báo sự cố.
     - **Body:** `{ "tree_id": 1, "reporter_name": "Nguyễn Văn A", "reporter_phone": "0901234567", "description": "Cành cây sà sát dây điện có nguy cơ chập", "image_url": "https://...", "severity": "Cao" }`
     - **Response:** `{ success: true, message: "Gửi phản ánh sự cố thành công", data: { id, ... } }`
  3. `PATCH /api/incidents/:id/status` — Đội cứu hộ cập nhật trạng thái (`status`: "Đang xử lý" | "Đã hoàn thành").

### 📌 Task `THUAN-04`: API Nhật ký Chăm sóc Thực địa (Care Records)
- **Files:** `backend/src/models/CareRecord.js`, `backend/src/controllers/careController.js`, `backend/src/routes/careRoutes.js`
- **Đặc tả Endpoints:**
  1. `GET /api/care-records` — Lấy lịch sử chăm sóc (cho phép query `?tree_id=...`).
  2. `POST /api/care-records` — Ghi nhận nhật ký sau khi nhân viên làm việc xong ngoài hiện trường.
     - **Body:** `{ "tree_id": 1, "caretaker_name": "Đội Cơ Động 1", "action_type": "Cắt tỉa", "notes": "Đã cắt 3 nhánh lớn nguy hiểm" }`
     - **Response:** `{ success: true, message: "Lưu nhật ký chăm sóc thành công", data: { id, ... } }`

### 📌 Lệnh kiểm thử dành cho AI của Thuận:
```powershell
# Chạy server thử nghiệm
npm start
# Kiểm tra endpoint
curl http://localhost:5001/api/trees
curl http://localhost:5001/api/incidents
curl http://localhost:5001/api/care-records
```

---

## ⛓️ 4. CHI TIẾT NHIỆM VỤ DÀNH CHO AI CỦA BẠN LÂM (BLOCKCHAIN & SECURITY)

### 📌 Task `LAM-01`: Smart Contract Bảo chứng Toàn vẹn (`UrbanTreeRegistry.sol`)
- **File:** `backend/contracts/UrbanTreeRegistry.sol`
- **Yêu cầu kỹ thuật:**
  - Chức năng `anchorRecord(string recordId, string recordType, string dataHash) external onlyAuthorized`:
    - Ghi nhận mã băm lên chuỗi, lưu `timestamp`, `recorder`, đánh dấu `exists = true`.
    - Chống ghi đè: Báo lỗi `"UrbanTree: Record already anchored (Tampering prevented)"` nếu `recordId` đã tồn tại.
  - Chức năng `verifyRecord(string recordId, string currentHash) external view returns (bool isValid, bool isExisted, uint256 timestamp, address recorder, string dataHash)`:
    - Trả về `isValid = true` khi `currentHash == stored.dataHash`.
    - Trả về `isValid = false` khi hash không khớp (phát hiện giả mạo database).
  - Phân quyền: Owner có quyền gọi `authorizeRecorder(address staffWallet)` để cấp quyền cho nhân viên.

### 📌 Task `LAM-02`: Bộ Kiểm thử Tự động Smart Contract (Hardhat Test)
- **File:** `backend/test/UrbanTreeRegistry.test.js`
- **Tiêu chuẩn hoàn thành:** Chạy `npx hardhat test` đạt tối thiểu 8/8 test passed:
  1. Khởi tạo & phân quyền owner
  2. Cấp quyền ví nhân viên
  3. Chặn ví không có quyền ghi dữ liệu
  4. Nhân viên ghi dấu bản ghi thành công
  5. Chặn hacker ghi đè dữ liệu cây đã có
  6. Đối chiếu dữ liệu chuẩn $\rightarrow$ `isValid = true`
  7. Đối chiếu dữ liệu bị sửa lén $\rightarrow$ `isValid = false`
  8. Kiểm tra tổng số bản ghi chuỗi

### 📌 Task `LAM-03`: Module Băm Dữ liệu Chuẩn hóa (Hash Service)
- **File:** `backend/src/services/hashService.js`
- **Nội dung:** Export hàm `hashTreeData(treeObject)` tuân thủ đúng chuẩn băm mục 2.

### 📌 Task `LAM-04`: API Neo Dữ liệu Lên Blockchain (Anchor Record)
- **File:** `backend/src/registry.js` (hoặc `backend/src/routes/blockchainRoutes.js`)
- **Đặc tả Endpoint:** `POST /api/record`
  - **Body:** `{ "recordId": "TREE-001", "recordType": "TREE_PROFILE", "dataHash": "64_hex_chars..." }`
  - **Xử lý:** Ký giao dịch gửi lên Smart Contract, đợi transaction đào xong.
  - **Response:** `{ "status": "ok", "txHash": "0x..." }` (400 nếu lỗi hoặc bị trùng lặp).

### 📌 Task `LAM-05`: API Cổng Đối chiếu & Phát hiện Gian lận (Verify Gate A19)
- **File:** `backend/src/registry.js`
- **Đặc tả Endpoint:** `GET /api/verify/:id`
  - **Query:** `?currentHash=...` (tính toán từ DB thực tế)
  - **Xử lý:** Gọi `contract.verifyRecord(id, currentHash)`.
  - **Response:**
    ```json
    {
      "isValid": true,
      "isExisted": true,
      "timestamp": 1730000000,
      "recorder": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "dataHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
    ```

### 📌 Lệnh kiểm thử dành cho AI của Lâm:
```powershell
# Chạy toàn bộ test hợp đồng thông minh
npx hardhat test

# Khởi chạy node Hardhat cục bộ
npx hardhat node

# Deploy hợp đồng lên mạng nội bộ
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🔀 5. QUY TẮC PHỐI HỢP GIT TỰ ĐỘNG DÀNH CHO AI AGENT

Khi người dùng ra lệnh cho AI agent commit và push code:

1. **Kiểm tra trạng thái trước khi add:**
   ```powershell
   git status
   ```
2. **Chỉ `git add` đúng các file trong phạm vi nhiệm vụ của mình:**
   - AI của Thuận: `git add backend/src/controllers/ backend/src/models/ backend/src/routes/treeRoutes.js ...`
   - AI của Lâm: `git add backend/contracts/ backend/test/ backend/src/registry.js ...`
   - **Tuyệt đối KHÔNG gõ `git add .` bừa bãi** khi chưa kiểm tra danh sách file bị sửa đổi.
3. **Quy chuẩn thông điệp commit (Conventional Commits):**
   - Thuận: `feat(api): add tree CRUD and qr code generation`
   - Lâm: `feat(blockchain): implement data verification endpoint`

---

*Tài liệu này là quy chuẩn kỹ thuật chính thức. Bất kỳ AI Agent nào khi tham gia phát triển dự án UrbanTree đều phải tuân thủ tuyệt đối các chỉ dẫn trên.*
