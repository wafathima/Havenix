const Tracking = require("../../models/Tracking");
const Project = require("../../models/Project");
const Milestone = require("../../models/Milestone");
const fs = require('fs');
const path = require('path');


const getTrackingEntries = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const project = await Project.findOne({
      _id: projectId,
      builder: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    const filter = { project: projectId };
    
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const entries = await Tracking.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Tracking.countDocuments(filter);
    
    const stats = await Tracking.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          avgProgress: { $avg: "$progress" },
          totalWorkers: { $sum: "$workersPresent" },
          entriesWithMedia: {
            $sum: { $cond: [{ $gt: [{ $size: "$media" }, 0] }, 1, 0] }
          }
        }
      }
    ]);
    
    const statusBreakdown = await Tracking.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      entries,
      stats: stats[0] || { totalEntries: 0, avgProgress: 0, totalWorkers: 0, entriesWithMedia: 0 },
      statusBreakdown,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error("Error fetching tracking entries:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const fetchTrackingEntries = async (projectId) => {
  try {
    setLoading(p => ({ ...p, tracking: true }));
    
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const { data } = await API.get(`/builder/tracking/${projectId}?${params.toString()}`);
    
    if (data.success) {
      console.log("Tracking entries with media:", data.entries.map(e => ({
        id: e._id,
        title: e.title,
        media: e.media
      })));
      setTrackingEntries(data.entries || []);
    }
  } catch (error) {
    console.error("Error fetching tracking entries:", error);
    toast.error("Failed to load tracking data");
  } finally {
    setLoading(p => ({ ...p, tracking: false }));
  }
 };

const createTrackingEntry = async (req, res) => {
  try {
    console.log("=== CREATE TRACKING ENTRY DEBUG ===");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
    console.log("Files received:", req.files);
    
    const { projectId } = req.params;
    console.log("Project ID from params:", projectId);
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required"
      });
    }
    
    const project = await Project.findOne({
      _id: projectId,
      builder: req.user._id
    });
    
    if (!project) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const fullPath = path.join(__dirname, '../../uploads/tracking', file.filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    let media = [];
    if (req.files && req.files.length > 0) {
    media = req.files.map(file => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    return {
      url: `${baseUrl}/uploads/tracking/${file.filename}`, // Full URL
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      filename: file.filename,
      uploadedAt: new Date()
    };
  });
}
    
    let equipmentUsed = [];
    if (req.body.equipmentUsed) {
      try {
        equipmentUsed = JSON.parse(req.body.equipmentUsed);
      } catch (e) {
        equipmentUsed = req.body.equipmentUsed.split(',').map(item => item.trim());
      }
    }
    
    const entryData = {
      project: projectId,
      date: req.body.date || new Date(),
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'in_progress',
      progress: req.body.progress ? parseInt(req.body.progress) : 0,
      notes: req.body.notes,
      location: req.body.location,
      weather: req.body.weather,
      temperature: req.body.temperature ? parseFloat(req.body.temperature) : null,
      workersPresent: req.body.workersPresent ? parseInt(req.body.workersPresent) : null,
      equipmentUsed: equipmentUsed,
      media: media,
      createdBy: req.user._id
    };
    
    const requiredFields = ['title'];
    const missingFields = requiredFields.filter(field => !entryData[field]);
    
    if (missingFields.length > 0) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const fullPath = path.join(__dirname, '../../uploads/tracking', file.filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        fields: missingFields
      });
    }
    
    const entry = await Tracking.create(entryData);
    
    await Project.findByIdAndUpdate(projectId, {
      lastTrackingUpdate: new Date()
    });
    
    console.log("Tracking entry created successfully:", entry._id);
    
    res.status(201).json({
      success: true,
      entry,
      message: "Tracking entry added successfully"
    });
    
  } catch (error) {
    console.error("Error creating tracking entry:", error);
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fullPath = path.join(__dirname, '../../uploads/tracking', file.filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateTrackingEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await Tracking.findById(id).populate('project');
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Tracking entry not found"
      });
    }
    
    if (entry.project.builder.toString() !== req.user._id.toString()) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const fullPath = path.join(__dirname, '../../uploads/tracking', file.filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this entry"
      });
    }
    
    let media = [...entry.media];
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map(file => ({
        url: `/uploads/tracking/${file.filename}`,
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        filename: file.filename,
        uploadedAt: new Date()
      }));
      media = [...media, ...newMedia];
    }
    
    if (req.body.deleteMedia) {
      const mediaIdsToDelete = JSON.parse(req.body.deleteMedia);
      
      mediaIdsToDelete.forEach(mediaId => {
        const mediaItem = entry.media.id(mediaId);
        if (mediaItem) {
          const fullPath = path.join(__dirname, '../../uploads/tracking', mediaItem.filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });
      
      media = media.filter(m => !mediaIdsToDelete.includes(m._id.toString()));
    }
    
    let equipmentUsed = entry.equipmentUsed;
    if (req.body.equipmentUsed) {
      try {
        equipmentUsed = JSON.parse(req.body.equipmentUsed);
      } catch (e) {
        equipmentUsed = req.body.equipmentUsed.split(',').map(item => item.trim());
      }
    }
    
    entry.title = req.body.title || entry.title;
    entry.description = req.body.description || entry.description;
    entry.date = req.body.date || entry.date;
    entry.status = req.body.status || entry.status;
    entry.progress = req.body.progress ? parseInt(req.body.progress) : entry.progress;
    entry.notes = req.body.notes || entry.notes;
    entry.location = req.body.location || entry.location;
    entry.weather = req.body.weather || entry.weather;
    entry.temperature = req.body.temperature ? parseFloat(req.body.temperature) : entry.temperature;
    entry.workersPresent = req.body.workersPresent ? parseInt(req.body.workersPresent) : entry.workersPresent;
    entry.equipmentUsed = equipmentUsed;
    entry.media = media;
    
    await entry.save();
    
    res.json({
      success: true,
      entry,
      message: "Tracking entry updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating tracking entry:", error);
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fullPath = path.join(__dirname, '../../uploads/tracking', file.filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteTrackingEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await Tracking.findById(id).populate('project');
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Tracking entry not found"
      });
    }
    
    if (entry.project.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this entry"
      });
    }
    
    if (entry.media && entry.media.length > 0) {
      entry.media.forEach(mediaItem => {
        const fullPath = path.join(__dirname, '../../uploads/tracking', mediaItem.filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted media: ${fullPath}`);
        }
      });
    }
    
    await entry.deleteOne();
    
    res.json({
      success: true,
      message: "Tracking entry deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting tracking entry:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMilestones = async (req, res) => {
  try {
    console.log("=== GET MILESTONES CALLED ===");
    console.log("Params:", req.params);
    console.log("User:", req.user?._id);
    
    const { projectId } = req.params;
    console.log("Project ID:", projectId);
    
    const project = await Project.findOne({
      _id: projectId,
      builder: req.user._id
    });
    
    console.log("Project found:", project ? "Yes" : "No");
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    const { status } = req.query;
    const filter = { project: projectId };
    if (status) filter.status = status;
    
    const milestones = await Milestone.find(filter).sort({ dueDate: 1 });
    console.log(`Found ${milestones.length} milestones`);
    
    res.json({
      success: true,
      milestones
    });
    
  } catch (error) {
    console.error("Error in getMilestones:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createMilestone = async (req, res) => {
  try {
    const { projectId, title, description, dueDate, status, progress } = req.body;
    
    const project = await Project.findOne({
      _id: projectId,
      builder: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    const milestoneData = {
      project: projectId,
      title,
      description,
      dueDate: dueDate || null,
      status: status || 'pending',
      progress: progress ? parseInt(progress) : 0,
      createdBy: req.user._id
    };
    
    if (status === 'completed') {
      milestoneData.completedDate = req.body.completedDate || new Date();
    }
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Milestone title is required"
      });
    }
    
    const milestone = await Milestone.create(milestoneData);
    
    res.status(201).json({
      success: true,
      milestone,
      message: "Milestone created successfully"
    });
    
  } catch (error) {
    console.error("Error creating milestone:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const milestone = await Milestone.findById(id).populate('project');
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found"
      });
    }
    
    if (milestone.project.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this milestone"
      });
    }
    
    if (updates.title) milestone.title = updates.title;
    if (updates.description !== undefined) milestone.description = updates.description;
    if (updates.dueDate) milestone.dueDate = updates.dueDate;
    if (updates.progress) milestone.progress = parseInt(updates.progress);
    
    if (updates.status && updates.status !== milestone.status) {
      milestone.status = updates.status;
      
      if (updates.status === 'completed') {
        milestone.completedDate = updates.completedDate || new Date();
      }
      
      if (updates.status === 'pending' || updates.status === 'in_progress') {
        milestone.completedDate = null;
      }
    }
    
    await milestone.save();
    
    res.json({
      success: true,
      milestone,
      message: "Milestone updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating milestone:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    
    const milestone = await Milestone.findById(id).populate('project');
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found"
      });
    }
    
    if (milestone.project.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this milestone"
      });
    }
    
    await milestone.deleteOne();
    
    res.json({
      success: true,
      message: "Milestone deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting milestone:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ANALYTICS CONTROLLERS ====================

const getTrackingAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period = 'month' } = req.query;
    
    const project = await Project.findOne({
      _id: projectId,
      builder: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const progressTrend = await Tracking.aggregate([
      {
        $match: {
          project: project._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          date: { $first: "$date" },
          avgProgress: { $avg: "$progress" },
          totalWorkers: { $sum: "$workersPresent" },
          entries: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    
    const equipmentStats = await Tracking.aggregate([
      { $match: { project: project._id } },
      { $unwind: "$equipmentUsed" },
      {
        $group: {
          _id: "$equipmentUsed",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const weatherStats = await Tracking.aggregate([
      { $match: { project: project._id, weather: { $ne: null } } },
      {
        $group: {
          _id: "$weather",
          avgProgress: { $avg: "$progress" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const workerStats = await Tracking.aggregate([
      {
        $match: {
          project: project._id,
          workersPresent: { $ne: null },
          progress: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgWorkersPerDay: { $avg: "$workersPresent" },
          maxWorkers: { $max: "$workersPresent" },
          minWorkers: { $min: "$workersPresent" },
          totalWorkerDays: { $sum: "$workersPresent" }
        }
      }
    ]);
    
    res.json({
      success: true,
      analytics: {
        period,
        progressTrend,
        equipmentStats,
        weatherStats,
        workerStats: workerStats[0] || { avgWorkersPerDay: 0, maxWorkers: 0, minWorkers: 0, totalWorkerDays: 0 },
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching tracking analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTrackingSummary = async (req, res) => {
  try {
    const projects = await Project.find({ builder: req.user._id }).select('_id name status');
    
    const projectIds = projects.map(p => p._id);
    
    const latestUpdates = await Tracking.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: "$project",
          lastUpdate: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project"
        }
      },
      { $unwind: "$project" }
    ]);
    
    const milestoneStats = await Milestone.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: "$project",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      }
    ]);
    
    const overallStats = await Tracking.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: null,
          totalUpdates: { $sum: 1 },
          totalMedia: { $sum: { $size: "$media" } },
          avgProgress: { $avg: "$progress" },
          totalWorkerDays: { $sum: "$workersPresent" }
        }
      }
    ]);
    
    res.json({
      success: true,
      summary: {
        projects: projects.length,
        latestUpdates,
        milestoneStats,
        overallStats: overallStats[0] || { totalUpdates: 0, totalMedia: 0, avgProgress: 0, totalWorkerDays: 0 }
      }
    });
    
  } catch (error) {
    console.error("Error fetching tracking summary:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  // Tracking entries
  getTrackingEntries,
  createTrackingEntry,
  updateTrackingEntry,
  deleteTrackingEntry,
  fetchTrackingEntries,
  // Milestones
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  
  // Analytics
  getTrackingAnalytics,
  getTrackingSummary,
};