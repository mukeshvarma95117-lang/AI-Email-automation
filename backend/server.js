import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import contactsRoutes from './routes/contacts.js';
import groupsRoutes from './routes/groups.js';
import messagesRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';
import statsRoutes from './routes/stats.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startScheduler } from './services/schedulerService.js';
import { seedDatabase } from './database/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'SmartSend AI Backend', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', statsRoutes);

// Centralized error handler
app.use(errorHandler);

// Automatic DB seed and server launch
seedDatabase().then(() => {
  // Start background cron scheduler
  startScheduler();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 SmartSend AI Server running on http://localhost:${PORT}`);
    console.log(`🔐 Default admin login: admin@smartsend.ai / admin123`);
    console.log(`=======================================================`);
  });
}).catch(err => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

