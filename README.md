# 🌳 UrbanTree — Hệ thống Quản lý Cây xanh Đô thị (QR Code & Blockchain)

> **Học phần:** Đồ án 4 / Blockchain Cơ bản (CNTT2311)  
> **Nhóm thực hiện (2 thành viên):**  
> - **Đoàn Thế Thuần:** Backend nghiệp vụ, Database (SQLite), RESTful API, Seed data & Postman.  
> - **Trần Quang Lâm:** Smart Contract (Solidity), Hardhat Local Node, Hash Integrity (SHA-256), Frontend & Tích hợp xác minh.  
> **Thời gian triển khai:** Kế hoạch 20 ngày (Theo tài liệu chuẩn `URBANTREE_ROADMAP_20_NGAY_2_THANH_VIEN.md`).

---

## 📌 1. Mục tiêu & Vấn đề giải quyết

Dự án **UrbanTree** giải quyết 3 bài toán trọng tâm trong quản trị cây xanh đô thị:
1. **Định danh số & Tra cứu tức thì qua QR:** Mỗi cây xanh được cấp một mã công khai (`public_code`) và mã QR cố định. Bất kỳ ai (người dân, giám khảo) đều có thể dùng camera điện thoại quét để mở trang thông tin cây, tra cứu tuổi thọ, loài cây và gửi báo cáo sự cố (gãy cành, nghiêng đổ).
2. **Theo dõi tác nghiệp & Phân công sự cố:** Nhân viên ghi nhận nhật ký chăm sóc/cắt tỉa; Ban quản lý tiếp nhận phản ánh từ người dân và điều phối xử lý theo quy trình rõ ràng.
3. **Bảo chứng toàn vẹn dữ liệu (Blockchain EVM):** Mọi bản ghi quan trọng (Hồ sơ cây, Nhật ký chăm sóc, Biên bản xử lý sự cố) đều được chuẩn hóa payload, băm SHA-256 và neo mã Hash lên Smart Contract. Hệ thống cung cấp trang **Xác minh toàn vẹn** để phát hiện ngay lập tức nếu dữ liệu trong cơ sở dữ liệu bị chỉnh sửa trái phép (*Zero Mismatch*).

---

## 🛠️ 2. Công nghệ thực tế của Dự án (Locked Tech Stack)

Theo đúng hiện trạng mã nguồn và quyết định kỹ thuật khóa tại Roadmap:

| Thành phần | Công nghệ lựa chọn | Ghi chú kỹ thuật |
| :--- | :--- | :--- |
| **Backend API** | Node.js (v18+) + Express.js | Gọn nhẹ, hỗ trợ native thư viện Web3/Blockchain. |
| **Cơ sở dữ liệu** | SQLite 3 (`urbantree.db`) | Lưu trữ cục bộ, dễ đóng gói, không cần cài MySQL rườm rà khi chấm điểm. |
| **Blockchain** | Solidity (Smart Contract) + Hardhat | Chạy Hardhat Local EVM Node (Localhost:8545), không tốn phí gas thật. |
| **Web3 Client** | Ethers.js (v6) | Tương tác trực tiếp giữa Backend/Frontend và Smart Contract. |
| **Tính toàn vẹn** | SHA-256 Canonical Hashing | Chuẩn hóa JSON payload trước khi hash để chống lệch dấu vân tay dữ liệu. |
| **Mã định danh** | Thư viện `qrcode` | Tạo mã QR động trỏ thẳng về route công khai của từng cây. |
| **Giao diện người dùng**| Web Responsive (Mobile & Desktop) | Tối ưu hiển thị tốt trên điện thoại cho người dân/nhân viên và máy tính cho Admin. |

---

## 🚀 3. Luồng Nghiệp vụ & Kịch bản Trình diễn (Demo Flow)

1. **Luồng Công cộng (Người dân / Khách vãng lai):**
   - Quét mã QR trên thân cây $\rightarrow$ Mở trang web lý lịch cây (`/trees/:public_code`).
   - Bấm **"Gửi phản ánh sự cố"** $\rightarrow$ Điền thông tin + đính kèm vị trí $\rightarrow$ Nhận mã Ticket tra cứu tiến độ.

2. **Luồng Tác nghiệp (Nhân viên hiện trường):**
   - Đăng nhập $\rightarrow$ Quét mã QR cây cần chăm sóc $\rightarrow$ Nhập nội dung cắt tỉa/bón phân $\rightarrow$ Lưu bản ghi.
   - Hệ thống tự động băm bản ghi chăm sóc và gửi giao dịch neo Hash lên Smart Contract.

3. **Luồng Quản trị & Điều phối (Admin):**
   - Xem danh sách cây, danh mục loài cây, thêm mới cây và in mã QR hàng loạt.
   - Tiếp nhận phản ánh sự cố $\rightarrow$ Cập nhật trạng thái (Tiếp nhận $\rightarrow$ Đang xử lý $\rightarrow$ Đã xử lý).

4. **Luồng Kiểm toán & Xác minh Blockchain (Điểm nhấn đề tài):**
   - Mở màn hình **Xác minh tính toàn vẹn (Integrity Verifier)**.
   - Nhập ID hoặc mã cây $\rightarrow$ Hệ thống tính lại mã Hash từ Database hiện tại và đọc mã Hash lưu trên Blockchain.
   - **Kịch bản Demo 1 (Dữ liệu chuẩn):** Báo trạng thái Xanh lá (Hợp lệ, khớp 100%).
   - **Kịch bản Demo 2 (Giả lập gian lận):** Cố tình sửa 1 ký tự trong Database $\rightarrow$ Bấm xác minh $\rightarrow$ Báo Đỏ (Cảnh báo: Dữ liệu đã bị can thiệp trái phép!).

---

## 📂 4. Cấu trúc Dự án

```text
Da4/
├── backend/
│   ├── contracts/             # Smart Contract Solidity (UrbanTreeRegistry.sol)
│   ├── scripts/               # Script deploy contract (deploy.js)
│   ├── src/
│   │   ├── config/            # Cấu hình DB, Blockchain provider
│   │   ├── controllers/       # Controller xử lý nghiệp vụ (Tree, Care, Incident, Verify)
│   │   ├── models/            # Schema & truy vấn SQLite
│   │   ├── routes/            # Khai báo RESTful API endpoints
│   │   ├── services/          # Hash Service (SHA-256) & Blockchain Service
│   │   └── server.js          # File khởi chạy ứng dụng Express
│   ├── hardhat.config.js      # Cấu hình mạng Hardhat EVM local
│   ├── package.json           # Danh sách dependencies Backend & Blockchain
│   └── urbantree.db           # File Database SQLite
├── URBANTREE_ROADMAP_20_NGAY_2_THANH_VIEN.md # Kế hoạch chi tiết 20 ngày
└── README.md                  # Hướng dẫn tổng quan & khởi chạy hệ thống
```

---

## ⚡ 5. Hướng dẫn Khởi chạy Hệ thống

### 5.1. Yêu cầu môi trường
* Node.js phiên bản 18.x hoặc 20.x trở lên.
* Trình duyệt web hiện đại (Chrome / Edge / Firefox).

### 5.2. Cài đặt thư viện
Mở Terminal/PowerShell tại thư mục `backend`:
```powershell
cd backend
npm install
```

### 5.3. Khởi chạy Mạng Blockchain Local (Terminal 1)
```powershell
cd backend
npm run chain:node
```
*Lưu ý: Giữ terminal này luôn chạy để duy trì mạng EVM nội bộ (cung cấp 20 tài khoản ví mẫu).*

### 5.4. Biên dịch & Triển khai Smart Contract (Terminal 2)
```powershell
cd backend
npm run chain:deploy
```
*Sau khi deploy thành công, file `deployed-contract.json` sẽ được tạo/cập nhật với địa chỉ contract mới nhất.*

### 5.5. Khởi chạy Backend API (Terminal 2 tiếp tục)
```powershell
npm run dev
# Hoặc: npm start
```
* Server API sẽ lắng nghe tại: `http://localhost:3000` (hoặc cấu hình trong `.env`).
* Endpoint kiểm tra trạng thái: `GET http://localhost:3000/api/health`

---

## 👥 6. Phân chia Trách nhiệm (Theo Roadmap)

* **Đặng Thế Thuận (Backend / Database):** Phụ trách toàn bộ CRUD Tree, Incident, Care Logs, SQLite schema, Seed data dữ liệu mẫu và viết API kiểm thử qua Postman.
* **Trần Quang Lâm (Blockchain / Frontend):** Phụ trách Smart Contract, Hardhat deploy, module băm SHA-256, logic so khớp dữ liệu (Verify) và giao diện Web tích hợp.
