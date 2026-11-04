const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const registryRoutes = require('./registry');
const blockchainRoutes = require('./routes/blockchainRoutes');

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
app.use('/api', registryRoutes);              // Legacy endpoint (/api/record, /api/verify/:id)
app.use('/api/blockchain', blockchainRoutes); // Chuẩn Master Spec v2 (/api/blockchain/anchor, verify, explorer...)

// Root endpoint kiểm tra trạng thái máy chủ
app.get('/', (req, res) => {
  res.json({
    project: 'UrbanTree Backend API & Blockchain Registry',
    status: 'Running',
    version: '2.0.0',
    endpoints: {
      trees: '/api/trees',
      incidents: '/api/incidents',
      careRecords: '/api/care-records',
      blockchain: {
        status: '/api/blockchain/status',
        anchor: '/api/blockchain/anchor',
        verify: '/api/blockchain/verify/:recordId',
        explorer: '/api/blockchain/explorer',
        record: '/api/blockchain/record/:recordId'
      }
    }
  });
});

// Khởi chạy server nếu chạy trực tiếp
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 UrbanTree Backend Server đang chạy tại:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`👉 Danh sách API Cây xanh: http://localhost:${PORT}/api/trees`);
    console.log(`👉 Cổng Blockchain APIs: http://localhost:${PORT}/api/blockchain/status`);
    console.log(`👉 Explorer Hoạt động Sổ cái: http://localhost:${PORT}/api/blockchain/explorer`);
    console.log(`====================================================`);
  });
}

module.exports = app;
