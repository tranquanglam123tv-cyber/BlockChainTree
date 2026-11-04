const express = require('express');
const router = express.Router();

const treeController = require('../controllers/treeController');
const incidentController = require('../controllers/incidentController');
const careController = require('../controllers/careController');
const dashboardController = require('../controllers/dashboardController');

// ==========================================
// 📊 ROUTE THỐNG KÊ DASHBOARD (Figma A04)
// ==========================================
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// ==========================================
// 🌳 ROUTES CÂY XANH (Người 2 - Bạn Thuận)
// ==========================================
router.get('/trees', treeController.getAllTrees);
router.get('/trees/nearby', treeController.getNearbyTrees);
router.get('/trees/:id', treeController.getTreeById);
router.post('/trees', treeController.createTree);
router.put('/trees/:id', treeController.updateTree);
router.delete('/trees/:id', treeController.deleteTree);
router.get('/trees/:id/qr', treeController.generateQrCode);

// ==========================================
// ⚠️ ROUTES SỰ CỐ (Người 2 - Bạn Thuận)
// ==========================================
router.get('/incidents', incidentController.getAllIncidents);
router.get('/incidents/:id', incidentController.getIncidentById);
router.post('/incidents', incidentController.reportIncident);
router.patch('/incidents/:id/status', incidentController.updateIncidentStatus);

// ==========================================
// 💧 ROUTES CHĂM SÓC (Người 2 - Bạn Thuận)
// ==========================================
router.get('/care-records', careController.getAllCareRecords);
router.get('/care-records/:id', careController.getCareRecordById);
router.post('/care-records', careController.addCareRecord);

// ==========================================
// ⛓️ ROUTE BLOCKCHAIN VERIFY (Người 1 - Bạn Lâm sẽ cắm service vào đây)
// ==========================================
router.get('/verify/:tree_id', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint đối chiếu dữ liệu với Smart Contract (Dành cho Người 1 - Bạn Lâm kết nối)',
    tree_id: req.params.tree_id,
    blockchain_status: 'Ready for integration'
  });
});

module.exports = router;
