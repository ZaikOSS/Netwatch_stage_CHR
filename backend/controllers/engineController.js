const pingEngine = require('../services/pingService');

// GET /api/engine/status
function getStatus(req, res) {
  const status = pingEngine.getStatus();
  res.json(status);
}

// POST /api/engine/toggle (admin only)
async function toggleEngine(req, res) {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "'enabled' boolean field is required." });
    }
    
    await pingEngine.setEnabled(enabled);
    res.json({ message: `Engine ${enabled ? 'enabled' : 'disabled'}.` });
  } catch (error) {
    console.error('Error toggling engine:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/engine/interval (admin only)
async function setInterval(req, res) {
  try {
    const { interval } = req.body;
    if (!interval || typeof interval !== 'number') {
      return res.status(400).json({ error: "'interval' number field is required (seconds)." });
    }

    await pingEngine.setIntervalSeconds(interval);
    res.json({ message: `Interval updated to ${interval} seconds.` });
  } catch (error) {
    console.error('Error setting interval:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/engine/ping-all (admin only)
async function pingAll(req, res) {
  try {
    // Await the sweep so the caller knows it finished, 
    // though the DB updates happen in the background.
    await pingEngine.pingAll();
    res.json({ message: 'Manual ping sweep initiated and completed.' });
  } catch (error) {
    console.error('Error in ping-all:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/engine/ping/:id (admin or visitor)
async function pingDevice(req, res) {
  try {
    const { id } = req.params;
    const result = await pingEngine.pingDevice(id);
    res.json(result);
  } catch (error) {
    console.error(`Error pinging device ${req.params.id}:`, error);
    if (error.message === 'Device not found') {
      return res.status(404).json({ error: 'Device not found.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = {
  getStatus,
  toggleEngine,
  setInterval,
  pingAll,
  pingDevice
};
