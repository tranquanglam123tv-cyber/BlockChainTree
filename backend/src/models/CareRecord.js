const db = require('../config/db');

const CareRecord = {
  /**
   * Lấy danh sách lịch sử chăm sóc có hỗ trợ lọc theo tree_id, action_type và phân trang
   * @param {Object} [filters] { tree_id, action_type, limit, offset }
   * @param {Function} callback (err, rows)
   */
  getAll: (filters, callback) => {
    if (typeof filters === 'function') {
      callback = filters;
      filters = {};
    }
    filters = filters || {};

    let query = `
      SELECT care_records.*, trees.tree_code, trees.species, trees.location_name 
      FROM care_records 
      LEFT JOIN trees ON care_records.tree_id = trees.id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.tree_id) {
      query += ' AND care_records.tree_id = ?';
      params.push(parseInt(filters.tree_id));
    }

    if (filters.action_type) {
      query += ' AND care_records.action_type = ?';
      params.push(filters.action_type);
    }

    query += ' ORDER BY care_records.action_date DESC, care_records.id DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    db.all(query, params, callback);
  },

  /**
   * Lấy lịch sử chăm sóc theo ID
   * @param {number|string} id 
   * @param {Function} callback (err, row)
   */
  getById: (id, callback) => {
    const query = `
      SELECT care_records.*, trees.tree_code, trees.species, trees.location_name 
      FROM care_records 
      LEFT JOIN trees ON care_records.tree_id = trees.id 
      WHERE care_records.id = ?
    `;
    db.get(query, [id], callback);
  },

  /**
   * Lấy toàn bộ lịch sử chăm sóc của một cây cụ thể phục vụ Timeline
   * @param {number|string} tree_id 
   * @param {Function} callback (err, rows)
   */
  getByTreeId: (tree_id, callback) => {
    const query = `
      SELECT care_records.*, trees.tree_code, trees.species, trees.location_name 
      FROM care_records 
      LEFT JOIN trees ON care_records.tree_id = trees.id 
      WHERE care_records.tree_id = ? 
      ORDER BY care_records.action_date DESC, care_records.id DESC
    `;
    db.all(query, [tree_id], callback);
  },

  /**
   * Ghi nhận hoạt động chăm sóc thực địa
   * @param {Object} data { care_code, tree_id, staff_id, caretaker_name, action_type, health_before, health_after, notes, data_hash, anchor_status, action_date }
   * @param {Function} callback (err, newRecord)
   */
  create: (data, callback) => {
    const {
      care_code,
      tree_id,
      staff_id,
      caretaker_name,
      action_type,
      health_before,
      health_after,
      notes,
      image_before_url,
      image_after_url,
      data_hash,
      anchor_status,
      action_date
    } = data;

    const query = `
      INSERT INTO care_records (
        care_code, tree_id, staff_id, caretaker_name, action_type,
        health_before, health_after, notes, image_before_url, image_after_url,
        data_hash, anchor_status, action_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
    `;

    db.run(
      query,
      [
        care_code || null,
        tree_id,
        staff_id || null,
        caretaker_name,
        action_type,
        health_before || null,
        health_after || null,
        notes || '',
        image_before_url || null,
        image_after_url || null,
        data_hash || null,
        anchor_status || 'PENDING',
        action_date || null
      ],
      function (err) {
        if (err) return callback(err);
        callback(null, {
          id: this ? this.lastID : null,
          ...data
        });
      }
    );
  },

  /**
   * Cập nhật mã băm SHA-256 và trạng thái neo cho bản ghi chăm sóc
   * @param {number|string} id 
   * @param {string} data_hash 
   * @param {string} anchor_status 
   * @param {Function} callback 
   */
  updateAnchor: (id, data_hash, anchor_status, callback) => {
    const query = `UPDATE care_records SET data_hash = ?, anchor_status = ? WHERE id = ?`;
    db.run(query, [data_hash, anchor_status, id], function (err) {
      if (err) return callback(err);
      callback(null, { changes: this ? this.changes : 0 });
    });
  },

  /**
   * Xóa bản ghi chăm sóc
   * @param {number|string} id 
   * @param {Function} callback 
   */
  delete: (id, callback) => {
    const query = 'DELETE FROM care_records WHERE id = ?';
    db.run(query, [id], function (err) {
      if (err) return callback(err);
      callback(null, { changes: this ? this.changes : 0 });
    });
  }
};

module.exports = CareRecord;
