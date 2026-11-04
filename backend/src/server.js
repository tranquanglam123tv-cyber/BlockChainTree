const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const registryRoutes = require('./registry');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký API Routes
// 1. Database & Nghiệp vụ quản lý cây xanh (Thuận)
app.use('/api', apiRoutes);
// 2. Blockchain Smart Contract & Đối chiếu toàn vẹn dữ liệu (Lâm)
app.use('/api', registryRoutes);

// Root endpoint kiểm tra trạng thái máy chủ
app.get('/', (req, res) => {
  res.json({
    project: 'UrbanTree Backend API & Blockchain Registry',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      trees: '/api/trees',
      incidents: '/api/incidents',
      careRecords: '/api/care-records',
      blockchainRecord: '/api/record',
      blockchainVerify: '/api/verify/:id'
    }
  });
});

// Khởi chạy server nếu chạy trực tiếp
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 UrbanTree Backend Server đang chạy tại:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`👉 Danh sách API Cây xanh: http://localhost:${PORT}/api/trees`);
    console.log(`👉 Blockchain APIs: http://localhost:${PORT}/api/record`);
    console.log(`===============================================`);
  });
}

module.exports = app;
