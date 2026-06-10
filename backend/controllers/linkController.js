const { getDb } = require('../config/db');

// GET /api/links (accessible by everyone)
async function getLinks(req, res) {
  try {
    const db = await getDb();
    const links = await db.all('SELECT * FROM links');
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/links (admin only)
async function createLink(req, res) {
  try {
    const { source_device_id, target_device_id, interface_port } = req.body;
    
    if (!source_device_id || !target_device_id) {
      return res.status(400).json({ error: 'source_device_id and target_device_id are required.' });
    }

    const db = await getDb();
    
    // Verify devices exist
    const sourceDevice = await db.get('SELECT id FROM devices WHERE id = ?', [source_device_id]);
    const targetDevice = await db.get('SELECT id FROM devices WHERE id = ?', [target_device_id]);
    
    if (!sourceDevice || !targetDevice) {
      return res.status(400).json({ error: 'One or both devices do not exist.' });
    }

    const result = await db.run(
      'INSERT INTO links (source_device_id, target_device_id, interface_port) VALUES (?, ?, ?)',
      [source_device_id, target_device_id, interface_port]
    );

    const newLink = await db.get('SELECT * FROM links WHERE id = ?', [result.lastID]);
    res.status(201).json(newLink);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// DELETE /api/links/:id (admin only)
async function deleteLink(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const existing = await db.get('SELECT * FROM links WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Link not found.' });
    }

    await db.run('DELETE FROM links WHERE id = ?', [id]);
    res.json({ message: 'Link deleted successfully.' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = {
  getLinks,
  createLink,
  deleteLink
};
