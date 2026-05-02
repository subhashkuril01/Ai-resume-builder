const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const analyzerRoutes = require('./routes/analyzer');
const jobMatchRoutes = require('./routes/jobMatch');
const publicRoutes = require('./routes/public');
const resumeTestRoutes = require('./routes/resumeTests');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  message: { error: 'AI rate limit exceeded. Try again in an hour.' }
});
app.use('/api/', limiter);
app.use('/api/analyzer', aiLimiter);
app.use('/api/job-match', aiLimiter);
app.use('/api/resume-tests', aiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analyzer', analyzerRoutes);
app.use('/api/job-match', jobMatchRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/resume-tests', resumeTestRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

const ensureResumeIndexes = async () => {
  const collection = mongoose.connection.collection('resumes');
  let indexes = [];

  try {
    indexes = await collection.indexes();
  } catch (error) {
    if (error.codeName !== 'NamespaceNotFound') {
      throw error;
    }
  }

  const publicSlugIndex = indexes.find((index) => index.name === 'publicSlug_1');
  const needsRepair = publicSlugIndex && (
    !publicSlugIndex.partialFilterExpression ||
    publicSlugIndex.partialFilterExpression.isPublic !== true
  );

  if (needsRepair) {
    console.log('Repairing publicSlug index for shared resumes...');
    await collection.dropIndex('publicSlug_1');
  }

  await collection.createIndex(
    { publicSlug: 1 },
    {
      name: 'publicSlug_1',
      unique: true,
      partialFilterExpression: {
        isPublic: true,
        publicSlug: { $type: 'string' }
      }
    }
  );
};

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder');
    console.log('MongoDB connected successfully');
    await ensureResumeIndexes();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
});

module.exports = app;
