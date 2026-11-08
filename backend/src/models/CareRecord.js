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
   * @param {Object} data { tree_id, caretaker_name, action_type, notes, action_date }
   * @param {Function} callback (err, newRecord)
   */
  create: (data, callback) => {
    const {
      tree_id,
      caretaker_name,
      action_type,
      notes,
      action_date
    } = data;

    const query = `
      INSERT INTO care_records (tree_id, caretaker_name, action_type, notes, action_date)
      VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
    `;

    db.run(
      query,
      [
        tree_id,
        caretaker_name,
        action_type,
        notes || '',
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
