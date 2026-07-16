const { getDb } = require('../config/db');

exports.getLogs = async (req, res) => {
  try {
    const db = await getDb();
    
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default 20 per page
    const offset = (page - 1) * limit;

    // Get total count
    const countRow = await db.get('SELECT COUNT(*) as total FROM device_logs');
    const total = countRow.total;

    // Determine if export (fetch all)
    const fetchAll = req.query.export === 'true';

    let queryStr = `
      SELECT l.id, l.status, l.timestamp, d.name as device_name, d.ip_address, d.icon_type
      FROM device_logs l
      JOIN devices d ON l.device_id = d.id
      ORDER BY l.timestamp DESC
    `;
    
    let logs;
    if (fetchAll) {
       logs = await db.all(queryStr);
       return res.json({ logs, total, page: 1, totalPages: 1 });
    } else {
       queryStr += ` LIMIT ? OFFSET ?`;
       logs = await db.all(queryStr, [limit, offset]);
       return res.json({
         logs,
         total,
         page,
         totalPages: Math.ceil(total / limit)
       });
    }

  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
};
