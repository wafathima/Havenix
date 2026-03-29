const Expense = require("../../models/Expense");
const Project = require("../../models/Project");
const fs = require('fs');
const path = require('path');


const getExpenses = async (req, res) => {
  try {
    console.log("Fetching expenses for builder:", req.user._id);
    
    const { 
      page = 1, 
      limit = 20, 
      projectId, 
      category, 
      startDate, 
      endDate,
      status 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    const filter = { builder: req.user._id };
    
    if (projectId) filter.project = projectId;
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    console.log("Filter:", filter);
    
    // Fetch expenses with error handling for each part
    let expenses = [];
    let total = 0;
    
    try {
      expenses = await Expense.find(filter)
        .populate('project', 'name')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(); // Add .lean() for better performance
        
      total = await Expense.countDocuments(filter);
      console.log(`Found ${expenses.length} expenses out of ${total} total`);
    } catch (dbError) {
      console.error("Database error fetching expenses:", dbError);
      // Don't throw, continue with empty results
    }
    
    // Get summary statistics with try-catch
    let stats = { totalAmount: 0, count: 0, avgAmount: 0, minAmount: 0, maxAmount: 0 };
    try {
      const statsResult = await Expense.aggregate([
        { $match: { builder: req.user._id } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            avgAmount: { $avg: "$amount" },
            count: { $sum: 1 },
            minAmount: { $min: "$amount" },
            maxAmount: { $max: "$amount" }
          }
        }
      ]);
      
      if (statsResult && statsResult.length > 0) {
        stats = statsResult[0];
      }
    } catch (statsError) {
      console.error("Error calculating stats:", statsError);
      // Continue with default stats
    }
    
    // Get category breakdown with try-catch
    let categoryBreakdown = [];
    try {
      categoryBreakdown = await Expense.aggregate([
        { $match: { builder: req.user._id } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ]);
    } catch (categoryError) {
      console.error("Error calculating category breakdown:", categoryError);
    }
    
    // Get monthly totals for the last 6 months with try-catch
    let monthlyTotals = [];
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      monthlyTotals = await Expense.aggregate([
        { 
          $match: { 
            builder: req.user._id,
            date: { $gte: sixMonthsAgo }
          } 
        },
        {
          $group: {
            _id: { 
              year: { $year: "$date" },
              month: { $month: "$date" }
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
    } catch (monthlyError) {
      console.error("Error calculating monthly totals:", monthlyError);
    }
    
    // Send response
    res.json({
      success: true,
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats,
      categoryBreakdown,
      monthlyTotals
    });
    
  } catch (error) {
    console.error("Error in getExpenses:", error);
    // Send a proper error response
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch expenses",
      error: error.message 
    });
  }
};

// Get single expense
const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      builder: req.user._id
    }).populate('project', 'name location');
    
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: "Expense not found" 
      });
    }
    
    res.json({ success: true, expense });
    
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const createExpense = async (req, res) => {
  try {
    console.log("=== CREATE EXPENSE DEBUG ===");
    console.log("Request body:", req.body);
    console.log("File received:", req.file); // Check if file is received
    console.log("User ID:", req.user?._id);
    
    let receiptUrl = null;
    
    // Handle receipt upload
    if (req.file) {
      // The path should match your static file serving
      receiptUrl = `/uploads/expenses/${req.file.filename}`;
      console.log("Receipt URL being saved:", receiptUrl);
    }
    
    // Validate project if provided
    if (req.body.project && req.body.project !== '') {
      const project = await Project.findOne({
        _id: req.body.project,
        builder: req.user._id
      });
      
      if (!project) {
        // Clean up uploaded file if project validation fails
        if (req.file) {
          const fullPath = path.join(__dirname, '../../uploads/expenses', req.file.filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
        return res.status(400).json({ 
          success: false, 
          message: "Invalid project selected" 
        });
      }
    }
    
    // Parse tags if provided
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = req.body.tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }
    
    // Parse amount and ensure it's a number
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        const fullPath = path.join(__dirname, '../../uploads/expenses', req.file.filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      return res.status(400).json({ 
        success: false, 
        message: "Valid amount is required" 
      });
    }
    
    const expenseData = {
      title: req.body.title?.trim(),
      description: req.body.description?.trim(),
      amount: amount,
      date: req.body.date || new Date(),
      category: req.body.category,
      project: req.body.project || null,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference?.trim(),
      vendor: req.body.vendor?.trim(),
      receipt: receiptUrl,
      taxAmount: req.body.taxAmount ? parseFloat(req.body.taxAmount) : null,
      taxRate: req.body.taxRate ? parseFloat(req.body.taxRate) : null,
      status: req.body.status || 'paid',
      isRecurring: req.body.isRecurring === 'true' || req.body.isRecurring === true,
      recurringFrequency: req.body.recurringFrequency,
      recurringEndDate: req.body.recurringEndDate || null,
      notes: req.body.notes?.trim(),
      tags: tags,
      builder: req.user._id,
      createdBy: req.user._id
    };
    
    // Validate required fields
    const requiredFields = ['title', 'amount', 'category'];
    const missingFields = requiredFields.filter(field => !expenseData[field]);
    
    if (missingFields.length > 0) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        const fullPath = path.join(__dirname, '../../uploads/expenses', req.file.filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields", 
        fields: missingFields 
      });
    }
    
    const expense = await Expense.create(expenseData);
    console.log("Expense created successfully with ID:", expense._id);
    console.log("Saved receipt URL:", expense.receipt);
    
    res.status(201).json({ 
      success: true, 
      expense,
      message: "Expense added successfully" 
    });
    
  } catch (error) {
    console.error("Error creating expense:", error);
    
    // Clean up uploaded receipt if expense creation fails
    if (req.file) {
      const fullPath = path.join(__dirname, '../../uploads/expenses', req.file.filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log("Cleaned up uploaded file due to error");
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


// Update expense
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      builder: req.user._id
    });
    
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: "Expense not found" 
      });
    }
    
    let receiptUrl = expense.receipt;
    
    // Handle new receipt upload
    if (req.file) {
      // Delete old receipt if exists
      if (expense.receipt) {
        const oldFilename = path.basename(expense.receipt);
        const oldPath = path.join(__dirname, '../../uploads/expenses', oldFilename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      receiptUrl = `/uploads/expenses/${req.file.filename}`;
    }
    
    // Handle receipt deletion
    if (req.body.deleteReceipt === 'true') {
      if (expense.receipt) {
        const oldFilename = path.basename(expense.receipt);
        const oldPath = path.join(__dirname, '../../uploads/expenses', oldFilename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      receiptUrl = null;
    }
    
    // Parse tags if provided
    let tags = expense.tags;
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = req.body.tags.split(',').map(t => t.trim());
      }
    }
    
    // Update fields
    expense.title = req.body.title || expense.title;
    expense.description = req.body.description || expense.description;
    expense.amount = req.body.amount ? parseFloat(req.body.amount) : expense.amount;
    expense.date = req.body.date || expense.date;
    expense.category = req.body.category || expense.category;
    expense.project = req.body.project || expense.project;
    expense.paymentMethod = req.body.paymentMethod || expense.paymentMethod;
    expense.paymentReference = req.body.paymentReference || expense.paymentReference;
    expense.vendor = req.body.vendor || expense.vendor;
    expense.receipt = receiptUrl;
    expense.taxAmount = req.body.taxAmount ? parseFloat(req.body.taxAmount) : expense.taxAmount;
    expense.taxRate = req.body.taxRate ? parseFloat(req.body.taxRate) : expense.taxRate;
    expense.status = req.body.status || expense.status;
    expense.isRecurring = req.body.isRecurring === 'true' || req.body.isRecurring === true;
    expense.recurringFrequency = req.body.recurringFrequency || expense.recurringFrequency;
    expense.recurringEndDate = req.body.recurringEndDate || expense.recurringEndDate;
    expense.notes = req.body.notes || expense.notes;
    expense.tags = tags;
    
    await expense.save();
    
    res.json({ 
      success: true, 
      expense,
      message: "Expense updated successfully" 
    });
    
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      builder: req.user._id
    });
    
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: "Expense not found" 
      });
    }
    
    // Delete receipt file if exists
    if (expense.receipt) {
      const filename = path.basename(expense.receipt);
      const fullPath = path.join(__dirname, '../../uploads/expenses', filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted receipt: ${fullPath}`);
      }
    }
    
    await expense.deleteOne();
    
    res.json({ 
      success: true,
      message: "Expense deleted successfully" 
    });
    
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get expense statistics
const getExpenseStats = async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;
    
    const filter = { builder: req.user._id };
    
    if (projectId) filter.project = projectId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Get total by category
    const categoryStats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    // Get total by project
    const projectStats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$project",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "projectDetails"
        }
      }
    ]);
    
    // Get monthly trend
    const monthlyStats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { 
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Get status breakdown
    const statusStats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        categoryStats,
        projectStats,
        monthlyStats,
        statusStats
      }
    });
    
  } catch (error) {
    console.error("Error fetching expense stats:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
};