const Incident = require('../models/Incident');

/**
 * 1. Lấy danh sách sự cố (Hỗ trợ phân trang và bộ lọc: status, severity, tree_id)
 * Endpoint: GET /api/incidents?status=Chờ xử lý&severity=Khẩn cấp&page=1&limit=50
 */
exports.getAllIncidents = (req, res) => {
  const { status, severity, tree_id, page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
  const offset = (pageNum - 1) * limitNum;

  Incident.getAll({ status, severity, tree_id, limit: limitNum, offset }, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn danh sách sự cố',
        error: err.message
      });
    }

    res.json({
      success: true,
      count: rows.length,
      page: pageNum,
      limit: limitNum,
      filters: {
        status: status || null,
        severity: severity || null,
        tree_id: tree_id ? parseInt(tree_id) : null
      },
      data: rows
    });
  });
};

/**
 * 2. Lấy chi tiết một sự cố theo ID
 * Endpoint: GET /api/incidents/:id
 */
exports.getIncidentById = (req, res) => {
  const { id } = req.params;

  Incident.getById(id, (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn sự cố',
        error: err.message
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sự cố với ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: row
    });
  });
};

/**
 * 3. Tiếp nhận báo cáo sự cố mới từ người dân / nhân viên
 * Endpoint: POST /api/incidents
 */
exports.reportIncident = (req, res) => {
  const {
    tree_id,
    reporter_name,
    reporter_phone,
    description,
    image_url,
    severity
  } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mô tả chi tiết về sự cố'
    });
  }

  if (!reporter_name || !reporter_name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp họ tên người phản ánh'
    });
  }

  if (!reporter_phone || !reporter_phone.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp số điện thoại người phản ánh'
    });
  }

  const validSeverities = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];
  const finalSeverity = severity && validSeverities.includes(severity) ? severity : 'Trung bình';

  Incident.create(
    {
      tree_id: tree_id ? parseInt(tree_id) : null,
      reporter_name: reporter_name.trim(),
      reporter_phone: reporter_phone.trim(),
      description: description.trim(),
      image_url: image_url || '',
      severity: finalSeverity,
      status: 'Chờ xử lý'
    },
    (err, newIncident) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi lưu thông tin tiếp nhận sự cố',
          error: err.message
        });
      }

      // Format response chuẩn theo đặc tả THUAN-04
      res.status(201).json({
        success: true,
        message: 'Tiếp nhận phản ánh thành công. Đội cứu hộ đang điều phối.',
        incident_id: newIncident.id,
        data: newIncident
      });
    }
  );
};

/**
 * 4. Cập nhật trạng thái sự cố và mốc thời gian hoàn thành (phục vụ Blockchain anchor)
 * Endpoint: PATCH /api/incidents/:id/status
 */
exports.updateIncidentStatus = (req, res) => {
  const { id } = req.params;
  const { status, resolved_at } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp trạng thái mới cho sự cố'
    });
  }

  const validStatuses = ['Chờ xử lý', 'Đang xử lý', 'Đã hoàn thành', 'Từ chối'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Trạng thái không hợp lệ. Chỉ chấp nhận một trong các giá trị: ${validStatuses.join(', ')}`
    });
  }

  Incident.updateStatus(id, status, resolved_at, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật trạng thái sự cố',
        error: err.message
      });
    }

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sự cố với ID: ${id}`
      });
    }

    res.json({
      success: true,
      message: `Cập nhật trạng thái sự cố thành: ${status}`,
      incident_id: parseInt(id),
      status: result.status,
      resolved_at: result.resolved_at
    });
  });
};
