const { getDb } = require('../config/db');

exports.getLogs = async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all(`
      SELECT l.id, l.status, l.timestamp, d.name as device_name, d.ip_address, d.icon_type
      FROM device_logs l
      JOIN devices d ON l.device_id = d.id
      ORDER BY l.timestamp DESC
      LIMIT 1000
    `);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
};
