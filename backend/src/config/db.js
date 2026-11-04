const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../urbantree.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Không thể kết nối SQLite database:', err.message);
  } else {
    console.log('✅ Đã kết nối SQLite database:', dbPath);
  }
});

// Khởi tạo các bảng cho cơ sở dữ liệu nếu chưa tồn tại
db.serialize(() => {
  // Kích hoạt chế độ Foreign Keys trong SQLite theo chuẩn THUAN-01
  db.run("PRAGMA foreign_keys = ON;");

  // 1. Bảng Trees (Quản lý Cây xanh)
  db.run(`
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
    )
  `);

  // Tạo index cho tree_code để tối ưu tra cứu mã QR
  db.run(`CREATE INDEX IF NOT EXISTS idx_tree_code ON trees(tree_code);`);

  // 2. Bảng Incidents (Tiếp nhận Sự cố từ người dân / nhân viên)
  db.run(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tree_id INTEGER,
      reporter_name TEXT,
      reporter_phone TEXT,
      description TEXT NOT NULL,
      image_url TEXT,
      severity TEXT DEFAULT 'Trung bình',
      status TEXT DEFAULT 'Chờ xử lý',
      reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE SET NULL
    )
  `);

  // 3. Bảng CareRecords (Lịch sử Chăm sóc / Bảo dưỡng)
  db.run(`
    CREATE TABLE IF NOT EXISTS care_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tree_id INTEGER NOT NULL,
      caretaker_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      notes TEXT,
      action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE
    )
  `);

  // Chèn dữ liệu mẫu nếu bảng trees trống
  db.get("SELECT COUNT(*) AS count FROM trees", (err, row) => {
    if (!err && row && row.count === 0) {
      console.log('🌱 Đang chèn dữ liệu mẫu cây xanh...');
      const sampleTrees = [
        ['TREE-001', 'Cây Bàng Đài Loan', 'Công viên 23/9, Q.1, TP.HCM', 10.7684, 106.6934, '2023-01-15', 'Tốt'],
        ['TREE-002', 'Cây Giáng Hương', 'Đường Nguyễn Huệ, Q.1, TP.HCM', 10.7745, 106.7032, '2022-08-20', 'Tốt'],
        ['TREE-003', 'Cây Lim Xẹt', 'Công viên Tao Đàn, Q.3, TP.HCM', 10.7758, 106.6912, '2021-05-10', 'Cần chăm sóc']
      ];
      const stmt = db.prepare("INSERT INTO trees (tree_code, species, location_name, latitude, longitude, planted_date, health_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
      sampleTrees.forEach(tree => stmt.run(tree));
      stmt.finalize();
    }
  });
});

module.exports = db;
