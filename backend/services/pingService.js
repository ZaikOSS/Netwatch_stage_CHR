const ping = require('ping');
const { getDb } = require('../config/db');

class PingEngine {
  constructor() {
    this.timerId = null;
    this.isRunning = false;
    this.intervalSeconds = 10;
  }

  async initialize() {
    try {
      const db = await getDb();
      
      const enabledSetting = await db.get('SELECT value FROM settings WHERE key = ?', ['engine_enabled']);
      const intervalSetting = await db.get('SELECT value FROM settings WHERE key = ?', ['ping_interval']);
      
      this.intervalSeconds = intervalSetting ? parseInt(intervalSetting.value, 10) : 10;
      const isEnabled = enabledSetting ? enabledSetting.value === 'true' : true;

      if (isEnabled) {
        this.start();
      }
    } catch (error) {
      console.error('PingEngine initialization error:', error);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`PingEngine started with interval ${this.intervalSeconds}s.`);
    this.scheduleNextLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    console.log('PingEngine stopped.');
  }

  scheduleNextLoop() {
    if (!this.isRunning) return;

    this.timerId = setTimeout(async () => {
      await this.runSweep();
      this.scheduleNextLoop();
    }, this.intervalSeconds * 1000);
  }

  async setEnabled(enabled) {
    const db = await getDb();
    await db.run('UPDATE settings SET value = ? WHERE key = ?', [enabled ? 'true' : 'false', 'engine_enabled']);
    
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  async setIntervalSeconds(seconds) {
    const db = await getDb();
    await db.run('UPDATE settings SET value = ? WHERE key = ?', [seconds.toString(), 'ping_interval']);
    
    this.intervalSeconds = seconds;
    console.log(`PingEngine interval updated to ${seconds}s.`);
    
    if (this.isRunning) {
      // Restart loop to apply new interval immediately
      if (this.timerId) clearTimeout(this.timerId);
      this.scheduleNextLoop();
    }
  }

  async runSweep() {
    try {
      const db = await getDb();
      const devices = await db.all('SELECT id, ip_address FROM devices');
      
      // We ping all devices concurrently to avoid one slow IP blocking the rest
      const promises = devices.map(device => this.pingAndUpdate(device.id, device.ip_address));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error during ping sweep:', error);
    }
  }

  async pingAndUpdate(id, ipAddress) {
    try {
      const res = await ping.promise.probe(ipAddress, { timeout: 2 });
      const status = res.alive ? 'up' : 'down';
      
      const db = await getDb();
      if (res.alive) {
        await db.run('UPDATE devices SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
      } else {
        await db.run('UPDATE devices SET status = ? WHERE id = ?', [status, id]);
      }
      
      return { id, ip_address: ipAddress, status, alive: res.alive };
    } catch (error) {
      console.error(`Error pinging device ${id} (${ipAddress}):`, error);
      const db = await getDb();
      await db.run('UPDATE devices SET status = ? WHERE id = ?', ['down', id]);
      return { id, ip_address: ipAddress, status: 'down', alive: false };
    }
  }

  async pingAll() {
    await this.runSweep();
  }

  async pingDevice(id) {
    const db = await getDb();
    const device = await db.get('SELECT ip_address FROM devices WHERE id = ?', [id]);
    if (!device) {
      throw new Error('Device not found');
    }
    return await this.pingAndUpdate(id, device.ip_address);
  }

  getStatus() {
    return {
      enabled: this.isRunning,
      interval: this.intervalSeconds
    };
  }
}

// Export a singleton instance
const pingEngine = new PingEngine();
module.exports = pingEngine;
