const CareRecord = require('../models/CareRecord');
const Tree = require('../models/Tree');

/**
 * 1. Lấy danh sách lịch sử chăm sóc (Hỗ trợ lọc theo tree_id, action_type và phân trang)
 * Endpoint: GET /api/care-records?tree_id=1&action_type=Cắt tỉa&page=1&limit=50
 */
exports.getAllCareRecords = (req, res) => {
  const { tree_id, action_type, page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
  const offset = (pageNum - 1) * limitNum;

  CareRecord.getAll({ tree_id, action_type, limit: limitNum, offset }, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn lịch sử chăm sóc',
        error: err.message
      });
    }

    res.json({
      success: true,
      count: rows.length,
      page: pageNum,
      limit: limitNum,
      filters: {
        tree_id: tree_id ? parseInt(tree_id) : null,
        action_type: action_type || null
      },
      data: rows
    });
  });
};

/**
 * 2. Lấy chi tiết một bản ghi chăm sóc theo ID
 * Endpoint: GET /api/care-records/:id
 */
exports.getCareRecordById = (req, res) => {
  const { id } = req.params;

  CareRecord.getById(id, (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn bản ghi chăm sóc',
        error: err.message
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bản ghi chăm sóc với ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: row
    });
  });
};

/**
 * 3. Ghi nhận hoạt động chăm sóc thực địa mới từ nhân viên công viên (Quét QR)
 * Endpoint: POST /api/care-records
 */
exports.addCareRecord = (req, res) => {
  const {
    tree_id,
    caretaker_name,
    action_type,
    notes,
    action_date
  } = req.body;

  if (!tree_id) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mã ID cây xanh (tree_id)'
    });
  }

  if (!caretaker_name || !caretaker_name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp tên nhân viên / đội thực hiện chăm sóc'
    });
  }

  if (!action_type || !action_type.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn loại hành động chăm sóc'
    });
  }

  const validActionTypes = ['Tưới nước', 'Bón phân', 'Cắt tỉa', 'Trị sâu bệnh', 'Gia cố cọc'];
  if (!validActionTypes.includes(action_type.trim())) {
    return res.status(400).json({
      success: false,
      message: `Loại hành động không hợp lệ. Chỉ chấp nhận: ${validActionTypes.join(', ')}`
    });
  }

  // Kiểm tra xem cây xanh có tồn tại không
  Tree.getById(tree_id, (err, tree) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra thông tin cây',
        error: err.message
      });
    }

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: `Cây xanh với ID ${tree_id} không tồn tại trong hệ thống`
      });
    }

    // Tiến hành lưu bản ghi chăm sóc
    CareRecord.create(
      {
        tree_id: parseInt(tree_id),
        caretaker_name: caretaker_name.trim(),
        action_type: action_type.trim(),
        notes: (notes || '').trim(),
        action_date: action_date || null
      },
      (insertErr, newRecord) => {
        if (insertErr) {
          return res.status(500).json({
            success: false,
            message: 'Lỗi lưu bản ghi chăm sóc vào cơ sở dữ liệu',
            error: insertErr.message
          });
        }

        // Response chuẩn theo đặc tả THUAN-05
        res.status(201).json({
          success: true,
          care_id: newRecord.id,
          message: 'Đã lưu nhật ký bảo dưỡng thực địa',
          data: newRecord
        });
      }
    );
  });
};
