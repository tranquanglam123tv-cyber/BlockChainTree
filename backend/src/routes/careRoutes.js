const express = require('express');
const router = express.Router();
const careController = require('../controllers/careController');

// ==========================================
// 💧 ROUTES CHĂM SÓC (Nhiệm vụ THUAN-05 & THUAN-06)
// ==========================================

// Lấy danh sách lịch sử chăm sóc (lọc theo tree_id, action_type, phân trang)
router.get('/', careController.getAllCareRecords);

// Lấy chi tiết một bản ghi chăm sóc theo ID
router.get('/:id', careController.getCareRecordById);

// Ghi nhận hoạt động chăm sóc thực địa mới
router.post('/', careController.addCareRecord);

module.exports = router;
