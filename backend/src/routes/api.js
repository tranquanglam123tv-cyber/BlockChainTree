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
// ⛓️ ROUTE BLOCKCHAIN (Người 1 - Bạn Lâm)
// Các endpoint /api/record, /api/record/:id, /api/verify/:id được xử lý trực tiếp bởi registry.js
// ==========================================

module.exports = router;
