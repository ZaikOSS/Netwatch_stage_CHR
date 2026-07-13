require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { initDb } = require('./config/db');
const pingEngine = require('./services/pingService');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const linkRoutes = require('./routes/linkRoutes');
const engineRoutes = require('./routes/engineRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/engine', engineRoutes);
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Initialize DB and run seeding
    await initDb();
    console.log('Database initialized successfully.');

    // 2. Start Express Server
    app.listen(PORT, () => {
      console.log(`NetWatch backend server running on port ${PORT}`);
    });

    // 3. Boot up the background network ping service loop
    await pingEngine.initialize();

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
