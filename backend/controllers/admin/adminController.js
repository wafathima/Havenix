const User = require("../../models/User");
const Project = require("../../models/Project");
const Property = require("../../models/Property");
const Chat = require("../../models/Chat");
const Enquiry = require("../../models/Enquiry");
const Message = require("../../models/Message"); 


// ==================== DASHBOARD STATS ====================

const getDashboardStats = async (req, res) => {
  try {
    const [users, projects, properties, chats, enquiries] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Property.countDocuments(),
      Chat.countDocuments(),
      Enquiry.countDocuments()
    ]);

    const [buyers, sellers, builders, admins] = await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'builder' }),
      User.countDocuments({ role: 'admin' })
    ]);

    // Get recent activity counts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newUsers, newProjects, newProperties] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Project.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Property.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: users, buyers, sellers, builders, admins },
        projects: { total: projects },
        properties: { total: properties },
        chats: { total: chats },
        enquiries: { total: enquiries },
        recent: {
          newUsers,
          newProjects,
          newProperties
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats"
    });
  }
};

const getProjectsStats = async (req, res) => {
  try {
    const total = await Project.countDocuments();
    
    const statusBreakdown = await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      total,
      statusBreakdown
    });
  } catch (error) {
    console.error("Error fetching projects stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects stats"
    });
  }
};

const getPropertiesStats = async (req, res) => {
  try {
    const total = await Property.countDocuments();
    
    const statusBreakdown = await Property.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const typeBreakdown = await Property.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      total,
      statusBreakdown,
      typeBreakdown
    });
  } catch (error) {
    console.error("Error fetching properties stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties stats"
    });
  }
};

// ==================== USER MANAGEMENT ====================

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      let stats = {};
      
      if (user.role === 'builder') {
        const [projects, totalBudget] = await Promise.all([
          Project.countDocuments({ builder: user._id }),
          Project.aggregate([
            { $match: { builder: user._id } },
            { $group: { _id: null, total: { $sum: "$budget" } } }
          ])
        ]);
        stats.projects = projects;
        stats.totalBudget = totalBudget[0]?.total || 0;
      }
      
      if (user.role === 'seller') {
        const [properties, totalValue] = await Promise.all([
          Property.countDocuments({ seller: user._id }),
          Property.aggregate([
            { $match: { seller: user._id } },
            { $group: { _id: null, total: { $sum: "$price" } } }
          ])
        ]);
        stats.properties = properties;
        stats.totalValue = totalValue[0]?.total || 0;
      }
      
      if (user.role === 'buyer') {
        const [savedProperties, enquiries] = await Promise.all([
          Property.countDocuments({ savedBy: user._id }),
          Enquiry.countDocuments({ buyer: user._id })
        ]);
        stats.savedProperties = savedProperties;
        stats.enquiries = enquiries;
      }

      // Get last active
      const lastChat = await Chat.findOne({
        participants: user._id
      })
        .sort({ lastMessageAt: -1 })
        .select('lastMessageAt');

      return {
        ...user,
        stats,
        lastActive: lastChat?.lastMessageAt || user.lastLogin || user.updatedAt
      };
    }));

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get user-specific data based on role
    let roleData = {};
    
    if (user.role === 'builder') {
      const projects = await Project.find({ builder: userId })
        .select('name location budget status images createdAt')
        .sort({ createdAt: -1 });
      
      const stats = await Project.aggregate([
        { $match: { builder: user._id } },
        {
          $group: {
            _id: null,
            totalProjects: { $sum: 1 },
            totalBudget: { $sum: "$budget" },
            avgBudget: { $avg: "$budget" },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            }
          }
        }
      ]);

      roleData = {
        projects,
        stats: stats[0] || { totalProjects: 0, totalBudget: 0, avgBudget: 0, completed: 0 }
      };
    }

    if (user.role === 'seller') {
      const properties = await Property.find({ seller: userId })
        .select('title location price status images createdAt')
        .sort({ createdAt: -1 });
      
      const stats = await Property.aggregate([
        { $match: { seller: user._id } },
        {
          $group: {
            _id: null,
            totalProperties: { $sum: 1 },
            totalValue: { $sum: "$price" },
            avgPrice: { $avg: "$price" },
            sold: {
              $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] }
            }
          }
        }
      ]);

      roleData = {
        properties,
        stats: stats[0] || { totalProperties: 0, totalValue: 0, avgPrice: 0, sold: 0 }
      };
    }

    if (user.role === 'buyer') {
      const [enquiries, savedProperties] = await Promise.all([
        Enquiry.find({ buyer: userId })
          .populate('property', 'title location price images')
          .sort({ createdAt: -1 }),
        Property.find({ savedBy: userId })
          .select('title location price images')
          .sort({ createdAt: -1 })
      ]);

      roleData = {
        enquiries,
        savedProperties
      };
    }

    // Get recent activity
    const recentActivity = await getRecentUserActivity(userId, user.role);

    res.json({
      success: true,
      user,
      roleData,
      recentActivity
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details"
    });
  }
};


const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    console.log('Blocking user:', userId, 'with reason:', reason); // Debug log

    // Validate input
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Block reason is required"
      });
    }

    // Find the user to block
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Don't allow blocking admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot block admin users"
      });
    }

    // Check if already blocked
    if (user.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "User is already blocked"
      });
    }

    // Update user with block information
    user.isBlocked = true;
    user.blockedReason = reason;
    user.blockedAt = new Date();
    
    // Only set blockedBy if req.user exists (from auth middleware)
    if (req.user && req.user._id) {
      user.blockedBy = req.user._id;
    }
    
    await user.save();

    console.log('User blocked successfully:', user.name); // Debug log

    res.json({
      success: true,
      message: `User ${user.name} has been blocked successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason,
        blockedAt: user.blockedAt
      }
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to block user",
      error: error.message
    });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isBlocked = false;
    user.blockedReason = undefined;
    user.blockedAt = undefined;
    user.blockedBy = undefined;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} has been unblocked successfully`
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unblock user"
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin user"
        });
      }
    }

    // Delete user's associated data based on role
    if (user.role === 'builder') {
      await Project.deleteMany({ builder: userId });
    }
    
    if (user.role === 'seller') {
      await Property.deleteMany({ seller: userId });
    }

    if (user.role === 'buyer') {
      await Enquiry.deleteMany({ buyer: userId });
    }

    // Delete user's chats and messages
    const userChats = await Chat.find({ participants: userId });
    const chatIds = userChats.map(chat => chat._id);
    
    // Check if Message model exists before using it
    if (Message) {
      await Message.deleteMany({ chat: { $in: chatIds } });
    }
    await Chat.deleteMany({ participants: userId });

    // Finally delete the user
    await user.deleteOne();

    res.json({
      success: true,
      message: `User ${user.name} has been deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message // Add error details for debugging
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['buyer', 'seller', 'builder', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Don't allow changing the last admin's role
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot change the last admin's role"
        });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role"
    });
  }
};

// ==================== PROPERTY MANAGEMENT ====================

const getProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('seller', 'name email phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Property.countDocuments(query)
    ]);

    // Get additional stats for each property
    const propertiesWithStats = await Promise.all(properties.map(async (property) => {
      // Get enquiry count for this property
      const enquiryCount = await Enquiry.countDocuments({ property: property._id });
      
      return {
        ...property,
        stats: {
          enquiries: enquiryCount
        }
      };
    }));

    res.json({
      success: true,
      properties: propertiesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId)
      .populate('seller', 'name email phone')
      .lean();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Get enquiries for this property
    const enquiries = await Enquiry.find({ property: propertyId })
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get similar properties
    const similarProperties = await Property.find({
      _id: { $ne: propertyId },
      type: property.type,
      'location.city': property.location?.city
    })
      .select('title price location images')
      .limit(5);

    res.json({
      success: true,
      property,
      enquiries,
      similarProperties
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch property details",
      error: error.message
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Delete related enquiries first
    await Enquiry.deleteMany({ property: propertyId });

    // Delete the property
    await property.deleteOne();

    res.json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete property",
      error: error.message
    });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { status } = req.body;

    if (!['available', 'sold', 'rented', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    property.status = status;
    await property.save();

    res.json({
      success: true,
      message: `Property status updated to ${status}`,
      property
    });
  } catch (error) {
    console.error("Error updating property status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update property status",
      error: error.message
    });
  }
};


// ==================== PROJECT MANAGEMENT ====================

const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('builder', 'name email phone')
        .populate('seller', 'name email phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Project.countDocuments(query)
    ]);

    // Get additional stats for each project
    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      let totalExpenses = 0;
      let remainingBudget = project.price || 0;
      
      try {
        let Expense;
        try {
          Expense = require("../../models/Expense");
        } catch (e) {
          console.log("Expense model not found, skipping expense calculation");
        }

        if (Expense) {
          const expenses = await Expense.find({ project: project._id });
          totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
          remainingBudget = (project.price || 0) - totalExpenses;
        }
      } catch (error) {
        console.log("Error calculating expenses for project:", project._id);
      }
      
      // Calculate progress based on status
      const progress = calculateProjectProgress(project);
      
      return {
        ...project,
        stats: {
          totalExpenses,
          remainingBudget,
          progress,
          totalUnits: project.totalUnits || 0,
          availableUnits: project.availableUnits || 0
        }
      };
    }));

    res.json({
      success: true,
      projects: projectsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('builder', 'name email phone')
      .populate('seller', 'name email phone')
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    let expenses = [];
    let expenseSummary = { total: 0, byCategory: {} };
    
    try {
      let Expense;
      try {
        Expense = require("../../models/Expense");
      } catch (e) {
        console.log("Expense model not found");
      }

      if (Expense) {
        expenses = await Expense.find({ project: projectId })
          .populate('createdBy', 'name')
          .sort({ date: -1 });

        expenseSummary = expenses.reduce((acc, expense) => {
          acc.total += expense.amount;
          acc.byCategory[expense.category] = (acc.byCategory[expense.category] || 0) + expense.amount;
          return acc;
        }, { total: 0, byCategory: {} });
      }
    } catch (error) {
      console.log("Error fetching expenses:", error);
    }

    // Get timeline
    const timeline = await getProjectTimeline(projectId);

    res.json({
      success: true,
      project,
      expenses,
      expenseSummary,
      timeline,
      stats: {
        totalExpenses: expenseSummary.total,
        remainingBudget: (project.price || 0) - expenseSummary.total,
        expenseCategories: Object.keys(expenseSummary.byCategory).length,
        totalUnits: project.totalUnits || 0,
        availableUnits: project.availableUnits || 0,
        soldUnits: (project.totalUnits || 0) - (project.availableUnits || 0)
      }
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project details",
      error: error.message
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Delete related expenses if model exists
    try {
      let Expense;
      try {
        Expense = require("../../models/Expense");
        if (Expense) {
          await Expense.deleteMany({ project: projectId });
        }
      } catch (e) {
        console.log("Expense model not found, skipping expense deletion");
      }
    } catch (error) {
      console.log("Error deleting expenses:", error);
    }

    // Delete the project
    await project.deleteOne();

    res.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message
    });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    if (!['planning', 'ongoing', 'completed', 'onhold', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    project.status = status;
    if (status === 'completed') {
      project.completionDate = new Date();
    }
    await project.save();

    res.json({
      success: true,
      message: `Project status updated to ${status}`,
      project
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project status",
      error: error.message
    });
  }
};

const updateProjectBudget = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { budget } = req.body;

    if (!budget || budget < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget amount"
      });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    project.price = budget;
    await project.save();

    res.json({
      success: true,
      message: "Project budget updated successfully",
      project
    });
  } catch (error) {
    console.error("Error updating project budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project budget",
      error: error.message
    });
  }
};

// Helper function to calculate project progress
const calculateProjectProgress = (project) => {
  if (project.status === 'completed') return 100;
  if (project.status === 'planning') return 10;
  if (project.status === 'ongoing') return 50;
  if (project.status === 'onhold') return 25;
  if (project.status === 'cancelled') return 0;
  return 0;
};

// Helper function to get project timeline
const getProjectTimeline = async (projectId) => {
  const timeline = [];

  // Get project creation
  const project = await Project.findById(projectId).select('createdAt name');
  if (project) {
    timeline.push({
      type: 'created',
      description: `Project "${project.name}" was created`,
      date: project.createdAt,
      icon: 'create'
    });
  }

  // Get expense additions if model exists
  try {
    let Expense;
    try {
      Expense = require("../../models/Expense");
    } catch (e) {
      return timeline;
    }

    if (Expense) {
      const recentExpenses = await Expense.find({ project: projectId })
        .sort({ date: -1 })
        .limit(5)
        .select('description amount date category');

      recentExpenses.forEach(expense => {
        timeline.push({
          type: 'expense',
          description: `Expense added: ${expense.description || expense.category} - ₹${expense.amount}`,
          date: expense.date,
          icon: 'expense',
          data: expense
        });
      });
    }
  } catch (error) {
    console.log("Error fetching expenses for timeline:", error);
  }

  return timeline.sort((a, b) => b.date - a.date);
};



// ==================== HELPER FUNCTIONS ====================

const getRecentUserActivity = async (userId, role) => {
  const activities = [];

  // Get recent chats
  const recentChats = await Chat.find({ participants: userId })
    .populate('participants', 'name')
    .sort({ lastMessageAt: -1 })
    .limit(5)
    .select('lastMessage participants lastMessageAt');

  activities.push(...recentChats.map(chat => ({
    type: 'chat',
    description: `Chat with ${chat.participants.find(p => p._id.toString() !== userId.toString())?.name || 'user'}`,
    timestamp: chat.lastMessageAt,
    data: chat
  })));

  // Get role-specific activities
  if (role === 'builder') {
    const projects = await Project.find({ builder: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name updatedAt');

    activities.push(...projects.map(project => ({
      type: 'project',
      description: `Updated project: ${project.name}`,
      timestamp: project.updatedAt,
      data: project
    })));
  }

  if (role === 'seller') {
    const properties = await Property.find({ seller: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title updatedAt');

    activities.push(...properties.map(property => ({
      type: 'property',
      description: `Updated property: ${property.title}`,
      timestamp: property.updatedAt,
      data: property
    })));
  }

  if (role === 'buyer') {
    const enquiries = await Enquiry.find({ buyer: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('property', 'title')
      .select('property updatedAt');

    activities.push(...enquiries.map(enquiry => ({
      type: 'enquiry',
      description: `Enquired about: ${enquiry.property?.title || 'property'}`,
      timestamp: enquiry.updatedAt,
      data: enquiry
    })));
  }

  // Sort all activities by timestamp
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
};

// ==================== EXPORTS ====================

module.exports = {
  // Dashboard
  getDashboardStats,
  getProjectsStats,
  getPropertiesStats,
  
  // User Management
  getUsers,
  getUserById,
  blockUser,
  unblockUser,
  deleteUser,
  updateUserRole,

  //property Managment
  getProperties,
  getPropertyById,
  deleteProperty,
  updatePropertyStatus,

  //project Managment
  getProjects,
  getProjectById,
  deleteProject,
  updateProjectStatus,
  updateProjectBudget
  

};