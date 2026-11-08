const express = require('express');
const router = express.Router();
const treeController = require('../controllers/treeController');

// ==========================================
// 🌳 ROUTES CÂY XANH (Nhiệm vụ THUAN-02 & THUAN-03)
// ==========================================

// Lấy danh sách cây (hỗ trợ phân trang, lọc theo loài, tình trạng sức khỏe)
router.get('/', treeController.getAllTrees);

// Tìm kiếm cây theo tọa độ GPS bán kính (phục vụ bản đồ GIS A05)
// Lưu ý: Đặt trước /:id để không bị Express hiểu nhầm "nearby" là id
router.get('/nearby', treeController.getNearbyTrees);

// Lấy chi tiết cây theo ID hoặc mã tree_code
router.get('/:id', treeController.getTreeById);

// Xuất hình ảnh mã QR (Buffer PNG trực tiếp hoặc JSON Base64)
router.get('/:id/qr', treeController.generateQrCode);

// Thêm mới cây xanh & tự động sinh mã QR
router.post('/', treeController.createTree);

// Cập nhật thông tin cây
router.put('/:id', treeController.updateTree);

// Xóa cây khỏi hệ thống
router.delete('/:id', treeController.deleteTree);

module.exports = router;

