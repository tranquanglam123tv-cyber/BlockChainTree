const QRCode = require('qrcode');
const Tree = require('../models/Tree');

/**
 * 1. Lấy danh sách cây xanh (Hỗ trợ phân trang và bộ lọc: loài cây, tình trạng sức khỏe)
 * Endpoint: GET /api/trees?species=...&health_status=...&page=1&limit=50
 */
exports.getAllTrees = (req, res) => {
  const { species, health_status, page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
  const offset = (pageNum - 1) * limitNum;

  Tree.getAll({ species, health_status, limit: limitNum, offset }, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn cơ sở dữ liệu cây xanh',
        error: err.message
      });
    }

    res.json({
      success: true,
      count: rows.length,
      page: pageNum,
      limit: limitNum,
      filters: {
        species: species || null,
        health_status: health_status || null
      },
      data: rows
    });
  });
};

/**
 * 2. Lấy chi tiết một cây theo ID số hoặc mã định danh tree_code (VD: TREE-001)
 * Endpoint: GET /api/trees/:id
 */
exports.getTreeById = (req, res) => {
  const { id } = req.params;

  const handleResult = (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn thông tin cây',
        error: err.message
      });
    }
    if (!row) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thông tin cây với định danh: ${id}`
      });
    }
    res.json({
      success: true,
      data: row
    });
  };

  // Nếu là số, ưu tiên tìm theo ID; nếu không thấy hoặc là chuỗi mã, tìm theo tree_code
  if (!isNaN(id)) {
    Tree.getById(id, (err, row) => {
      if (err) return handleResult(err);
      if (row) return res.json({ success: true, data: row });
      // Thử tìm theo mã tree_code nếu không tìm thấy id
      Tree.getByCode(id, handleResult);
    });
  } else {
    Tree.getByCode(id, handleResult);
  }
};

/**
 * 3. Tìm kiếm cây xanh theo vị trí xung quanh (GIS Radius Search)
 * Endpoint: GET /api/trees/nearby?lat=10.7758&lng=106.6912&radius=3
 */
exports.getNearbyTrees = (req, res) => {
  const { lat, lng, radius } = req.query;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp tọa độ trung tâm lat và lng (Ví dụ: ?lat=10.7758&lng=106.6912&radius=5)'
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = parseFloat(radius) || 5;

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Tọa độ lat và lng phải là số thực hợp lệ'
    });
  }

  Tree.getNearby(latitude, longitude, radiusKm, (err, trees) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn cây xanh theo định vị GIS',
        error: err.message
      });
    }

    res.json({
      success: true,
      center: {
        latitude,
        longitude,
        radius_km: radiusKm
      },
      count: trees.length,
      data: trees
    });
  });
};

/**
 * 4. Thêm mới cây xanh & Tự động sinh mã QR (Tuân thủ đặc tả THUAN-03)
 * Endpoint: POST /api/trees
 */
exports.createTree = async (req, res) => {
  try {
    const {
      tree_code,
      species,
      location_name,
      latitude,
      longitude,
      planted_date,
      health_status
    } = req.body;

    if (!tree_code || !species || !location_name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ các trường bắt buộc: tree_code, species, location_name'
      });
    }

    // 1. Tự sinh nội dung QR chuẩn định dạng JSON theo đặc tả THUAN-03
    const qrPayload = {
      app: 'UrbanTree',
      code: tree_code,
      verifyUrl: `https://urbantree.hcm.gov.vn/verify/${tree_code}`
    };

    // 2. Chuyển thành DataURL (Base64 PNG) chuẩn { errorCorrectionLevel: 'H', width: 400 }
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
      errorCorrectionLevel: 'H',
      width: 400
    });

    // 3. Tự động lưu chuỗi Base64 này vào cột qr_code_url của bảng trees
    Tree.create(
      {
        tree_code,
        species,
        location_name,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        planted_date: planted_date || new Date().toISOString().split('T')[0],
        health_status: health_status || 'Tốt',
        qr_code_url: qrCodeUrl,
        data_hash: null
      },
      (err, newTree) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Lỗi thêm cây vào database (có thể mã cây đã tồn tại hoặc vi phạm CHECK constraint)',
            error: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'Thêm mới cây xanh và sinh mã QR thành công',
          data: newTree
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi sinh mã QR cho cây',
      error: error.message
    });
  }
};

/**
 * 5. Xuất hình ảnh mã QR (Tuân thủ đặc tả THUAN-03)
 * Endpoint: GET /api/trees/:id/qr
 * Mặc định: Trả về trực tiếp buffer hình ảnh PNG để hiển thị hoặc in ấn nhãn thẻ nhôm đúc
 * Nếu thêm ?format=json hoặc ?format=base64: Trả về chuỗi base64 qua JSON
 */
exports.generateQrCode = (req, res) => {
  const { id } = req.params;

  const onTreeFound = async (err, tree) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn cây xanh',
        error: err.message
      });
    }

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy cây với định danh: ${id} để xuất mã QR`
      });
    }

    try {
      // Nội dung mã QR chuẩn hóa
      const qrPayload = {
        app: 'UrbanTree',
        code: tree.tree_code,
        verifyUrl: `https://urbantree.hcm.gov.vn/verify/${tree.tree_code}`
      };

      // Tự động đồng bộ cập nhật qr_code_url trong DB nếu cây chưa có
      if (!tree.qr_code_url) {
        const base64Url = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          errorCorrectionLevel: 'H',
          width: 400
        });
        Tree.updateQrUrl(tree.id, base64Url, () => {});
      }

      // Trường hợp ứng dụng muốn nhận chuỗi Base64 qua JSON
      if (req.query.format === 'json' || req.query.format === 'base64') {
        const base64Url = tree.qr_code_url || (await QRCode.toDataURL(JSON.stringify(qrPayload), {
          errorCorrectionLevel: 'H',
          width: 400
        }));

        return res.json({
          success: true,
          tree_code: tree.tree_code,
          species: tree.species,
          qr_code_url: base64Url
        });
      }

      // Mặc định: Trả về trực tiếp binary buffer PNG chuẩn công nghiệp
      const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrPayload), {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 400,
        margin: 2
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="qr-${tree.tree_code}.png"`);
      res.send(qrBuffer);
    } catch (qrErr) {
      res.status(500).json({
        success: false,
        message: 'Lỗi trong quá trình tạo file ảnh mã QR',
        error: qrErr.message
      });
    }
  };

  if (!isNaN(id)) {
    Tree.getById(id, (err, row) => {
      if (err) return onTreeFound(err);
      if (row) return onTreeFound(null, row);
      Tree.getByCode(id, onTreeFound);
    });
  } else {
    Tree.getByCode(id, onTreeFound);
  }
};

/**
 * 6. Cập nhật thông tin cây xanh
 * Endpoint: PUT /api/trees/:id
 */
exports.updateTree = (req, res) => {
  const { id } = req.params;

  Tree.update(id, req.body, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật cây xanh',
        error: err.message
      });
    }

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cây cần cập nhật'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin cây xanh thành công'
    });
  });
};

/**
 * 7. Xóa cây xanh khỏi hệ thống
 * Endpoint: DELETE /api/trees/:id
 */
exports.deleteTree = (req, res) => {
  const { id } = req.params;

  Tree.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi xóa cây khỏi hệ thống',
        error: err.message
      });
    }

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cây cần xóa'
      });
    }

    res.json({
      success: true,
      message: 'Xóa cây xanh thành công'
    });
  });
};
