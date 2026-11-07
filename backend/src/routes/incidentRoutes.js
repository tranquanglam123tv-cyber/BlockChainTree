const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

// ==========================================
// ⚠️ ROUTES SỰ CỐ (Nhiệm vụ THUAN-04 & THUAN-06)
// ==========================================

// Lấy danh sách sự cố (lọc theo status, severity, tree_id, phân trang)
router.get('/', incidentController.getAllIncidents);

// Lấy chi tiết một sự cố theo ID
router.get('/:id', incidentController.getIncidentById);

// Tiếp nhận báo cáo sự cố từ người dân / nhân viên
router.post('/', incidentController.reportIncident);

// Cập nhật trạng thái sự cố và ngày hoàn thành (chuẩn bị neo Blockchain)
router.patch('/:id/status', incidentController.updateIncidentStatus);

module.exports = router;
