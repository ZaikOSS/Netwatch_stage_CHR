const { getDb } = require('../config/db');

// GET /api/devices (accessible by everyone)
async function getDevices(req, res) {
  try {
    const db = await getDb();
    const devices = await db.all('SELECT * FROM devices');
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/devices (admin only)
async function createDevice(req, res) {
  try {
    const { name, ip_address, icon_type } = req.body;
    if (!name || !ip_address || !icon_type) {
      return res.status(400).json({ error: 'Name, ip_address, and icon_type are required.' });
    }

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO devices (name, ip_address, icon_type, status) VALUES (?, ?, ?, ?)',
      [name, ip_address, icon_type, 'unknown']
    );

    const newDevice = await db.get('SELECT * FROM devices WHERE id = ?', [result.lastID]);
    res.status(201).json(newDevice);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// PUT /api/devices/:id (admin only)
async function updateDevice(req, res) {
  try {
    const { id } = req.params;
    const { name, ip_address, icon_type } = req.body;

    const db = await getDb();
    
    // Check if exists
    const existing = await db.get('SELECT * FROM devices WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Device not found.' });
    }

    await db.run(
      'UPDATE devices SET name = COALESCE(?, name), ip_address = COALESCE(?, ip_address), icon_type = COALESCE(?, icon_type) WHERE id = ?',
      [name, ip_address, icon_type, id]
    );

    const updatedDevice = await db.get('SELECT * FROM devices WHERE id = ?', [id]);
    res.json(updatedDevice);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// DELETE /api/devices/:id (admin only)
async function deleteDevice(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    // Check if exists
    const existing = await db.get('SELECT * FROM devices WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Device not found.' });
    }

    // ON DELETE CASCADE will handle links removal automatically
    await db.run('DELETE FROM devices WHERE id = ?', [id]);
    
    res.json({ message: 'Device deleted successfully.' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// PUT /api/devices/:id/position (admin only)
async function updatePosition(req, res) {
  try {
    const { id } = req.params;
    const { x, y } = req.body;
    if (x === undefined || y === undefined) {
      return res.status(400).json({ error: 'x and y coordinates are required.' });
    }
    const db = await getDb();
    await db.run('UPDATE devices SET pos_x = ?, pos_y = ? WHERE id = ?', [x, y, id]);
    res.json({ message: 'Position updated successfully' });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  updatePosition
};
