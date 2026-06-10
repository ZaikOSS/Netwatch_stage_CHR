const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');

// POST /api/users (admin only)
async function createUser(req, res) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'visitor';

    const db = await getDb();
    
    // Check if user already exists
    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await db.run(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hash, assignedRole]
    );

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// GET /api/users (admin only)
async function getUsers(req, res) {
  try {
    const db = await getDb();
    const users = await db.all('SELECT id, username, role FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// DELETE /api/users/:id (admin only)
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    // Prevent deleting the very first admin account as a safety feature
    if (id == 1) {
       return res.status(403).json({ error: 'Cannot delete the master administrator account.' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = {
  createUser,
  getUsers,
  deleteUser
};
