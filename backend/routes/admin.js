const express = require('express');
const { protect, isAdmin } = require('../middleware/auth');
const {
  getDashboard,
  getUsers,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getResumes,
  deleteResume,
  getAnalytics,
  logUsage
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect, isAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Users management
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);

// Resumes management
router.get('/resumes', getResumes);
router.delete('/resumes/:id', deleteResume);

// Analytics
router.get('/analytics', getAnalytics);

// Usage logging
router.post('/usage-log', logUsage);

module.exports = router;
