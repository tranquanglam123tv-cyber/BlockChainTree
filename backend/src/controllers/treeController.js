const QRCode = require('qrcode');
const Tree = require('../models/Tree');

// 1. Lấy danh sách tất cả cây
exports.getAllTrees = (req, res) => {
  Tree.getAll((err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi truy vấn cơ sở dữ liệu', error: err.message });
    }
    res.json({ success: true, count: rows.length, data: rows });
  });
};

// 2. Lấy chi tiết cây theo ID hoặc Code
exports.getTreeById = (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);

  const fetchCallback = (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi truy vấn cơ sở dữ liệu', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin cây' });
    }
    res.json({ success: true, data: row });
  };

  if (isNumeric) {
    Tree.getById(id, fetchCallback);
  } else {
    Tree.getByCode(id, fetchCallback);
  }
};

// 3. Thêm mới cây xanh & tự động tạo mã QR
exports.createTree = async (req, res) => {
  try {
    const { tree_code, species, location_name, latitude, longitude, planted_date, health_status } = req.body;

    if (!tree_code || !species || !location_name) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ: tree_code, species, location_name' });
    }

    // Tạo mã QR chứa thông tin nhận diện cây
    const qrDataPayload = JSON.stringify({
      code: tree_code,
      species: species,
      location: location_name
    });

    const qrCodeUrl = await QRCode.toDataURL(qrDataPayload);

    Tree.create({
      tree_code,
      species,
      location_name,
      latitude: latitude || 0,
      longitude: longitude || 0,
      planted_date: planted_date || new Date().toISOString().split('T')[0],
      health_status: health_status || 'Tốt',
      qr_code_url: qrCodeUrl,
      data_hash: null
    }, (err, newTree) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Lỗi thêm cây vào database (có thể mã cây đã tồn tại)', error: err.message });
      }
      res.status(201).json({ success: true, message: 'Thêm cây xanh thành công', data: newTree });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tạo QR Code', error: error.message });
  }
};

// 4. Tạo hoặc cấp lại mã QR Code cho cây
exports.generateQrCode = async (req, res) => {
  const { id } = req.params;

  Tree.getById(id, async (err, tree) => {
    if (err || !tree) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cây để tạo mã QR' });
    }

    try {
      const qrPayload = JSON.stringify({
        id: tree.id,
        tree_code: tree.tree_code,
        species: tree.species,
        location: tree.location_name
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

      Tree.updateQrUrl(id, qrCodeDataUrl, (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ success: false, message: 'Lỗi cập nhật mã QR vào database' });
        }
        res.json({
          success: true,
          message: 'Tạo mã QR thành công',
          tree_code: tree.tree_code,
          qr_code: qrCodeDataUrl
        });
      });
    } catch (qrErr) {
      res.status(500).json({ success: false, message: 'Lỗi tạo hình ảnh QR Code', error: qrErr.message });
    }
  });
};

// 5. Cập nhật thông tin cây
exports.updateTree = (req, res) => {
  const { id } = req.params;
  Tree.update(id, req.body, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật cây', error: err.message });
    }
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cây cần cập nhật' });
    }
    res.json({ success: true, message: 'Cập nhật cây thành công' });
  });
};

// 6. Xóa cây
exports.deleteTree = (req, res) => {
  const { id } = req.params;
  Tree.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa cây', error: err.message });
    }
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cây cần xóa' });
    }
    res.json({ success: true, message: 'Xóa cây thành công' });
  });
};
