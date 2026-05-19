const User = require('../models/User');
const Resume = require('../models/Resume');
const AdminUsageLog = require('../models/AdminUsageLog');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc Get dashboard stats
// @route GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get total users
  const totalUsers = await User.countDocuments();

  // Get total resumes
  const totalResumes = await Resume.countDocuments();

  // Get active users (last 7 days)
  const activeUsers = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  // Get AI usage stats (last 7 days)
  const aiUsageStats = await AdminUsageLog.aggregate([
    {
      $match: { createdAt: { $gte: sevenDaysAgo } }
    },
    {
      $group: {
        _id: '$requestType',
        count: { $sum: 1 },
        tokensUsed: { $sum: '$tokensUsed' },
        totalCost: { $sum: '$costEstimate' }
      }
    }
  ]);

  // Get recent activities
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email role createdAt status');

  const recentResumes = await Resume.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email')
    .select('title userId createdAt');

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalResumes,
      activeUsers,
      aiUsageStats
    },
    recentActivities: {
      users: recentUsers,
      resumes: recentResumes
    }
  });
});

// @desc Get all users with pagination and search
// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('name email role status createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  });
});

// @desc Delete user
// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Delete user's resumes
  await Resume.deleteMany({ userId: req.params.id });

  res.json({ success: true, message: 'User deleted successfully.' });
});

// @desc Block/Unblock user
// @route PATCH /api/admin/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).select('name email role status createdAt');

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ success: true, user });
});

// @desc Promote user to admin
// @route PATCH /api/admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role value.' });
  }

  // Prevent demoting the only admin (optional check)
  if (role === 'user') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 1) {
      return res.status(400).json({ error: 'Cannot demote the only admin.' });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('name email role status createdAt');

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ success: true, user });
});

// @desc Get all resumes with pagination
// @route GET /api/admin/resumes
const getResumes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  const query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const resumes = await Resume.find(query)
    .populate('userId', 'name email')
    .select('title userId createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Resume.countDocuments(query);

  res.json({
    success: true,
    data: resumes,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  });
});

// @desc Delete resume
// @route DELETE /api/admin/resumes/:id
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findByIdAndDelete(req.params.id);

  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  // Remove from user's resumes array
  await User.findByIdAndUpdate(resume.userId, {
    $pull: { resumes: req.params.id }
  });

  res.json({ success: true, message: 'Resume deleted successfully.' });
});

// @desc Get analytics
// @route GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Usage by type
  const usageByType = await AdminUsageLog.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: '$requestType',
        count: { $sum: 1 },
        tokensUsed: { $sum: '$tokensUsed' },
        totalCost: { $sum: '$costEstimate' }
      }
    }
  ]);

  // Daily usage
  const dailyUsage = await AdminUsageLog.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        tokensUsed: { $sum: '$tokensUsed' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Top users by usage
  const topUsers = await AdminUsageLog.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: '$userId',
        count: { $sum: 1 },
        tokensUsed: { $sum: '$tokensUsed' },
        totalCost: { $sum: '$costEstimate' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    }
  ]);

  res.json({
    success: true,
    analytics: {
      usageByType,
      dailyUsage,
      topUsers: topUsers.map(item => ({
        userId: item._id,
        userName: item.user[0]?.name || 'Unknown',
        userEmail: item.user[0]?.email || 'Unknown',
        count: item.count,
        tokensUsed: item.tokensUsed,
        totalCost: item.totalCost
      }))
    }
  });
});

// @desc Log AI usage
// @route POST /api/admin/usage-log
const logUsage = asyncHandler(async (req, res) => {
  const { userId, requestType, tokensUsed = 0, costEstimate = 0 } = req.body;

  const log = await AdminUsageLog.create({
    userId,
    requestType,
    tokensUsed,
    costEstimate,
    status: 'success'
  });

  res.status(201).json({ success: true, log });
});

module.exports = {
  getDashboard,
  getUsers,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getResumes,
  deleteResume,
  getAnalytics,
  logUsage
};
