const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const treeRoutes = require('./routes/treeRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const careRoutes = require('./routes/careRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký API Routes theo từng Module chuẩn hóa
app.use('/api/trees', treeRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/care-records', careRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);

// Root endpoint kiểm tra trạng thái máy chủ
app.get('/', (req, res) => {
  res.json({
    project: 'UrbanTree Backend API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      dashboard: '/api/dashboard/stats',
      trees: '/api/trees',
      incidents: '/api/incidents',
      careRecords: '/api/care-records',
      verify: '/api/verify/:tree_id'
    }
  });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 UrbanTree Backend Server đang chạy tại:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 Danh sách API: http://localhost:${PORT}/api/trees`);
  console.log(`===============================================`);
});
