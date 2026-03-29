const Project = require("../../models/Project");
const fs = require('fs');
const path = require('path');


const getMyProjects = async (req, res) => {
  try {
    console.log("Fetching projects for builder:", req.user._id);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const projects = await Project.find({ builder: req.user._id })
      .populate('builder', 'name email profilePic city phone companyName')
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);
      
    const total = await Project.countDocuments({ builder: req.user._id });
    
    console.log(`Found ${projects.length} projects for builder`);
    
    res.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error("Error fetching my projects:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const createProject = async (req, res) => {
  try {
    console.log("=== CREATE PROJECT DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Files received:", req.files ? req.files.length : 0);
    console.log("User ID:", req.user?._id);
    
    let imageUrls = [];
    
if (req.files && req.files.length > 0) {
  imageUrls = req.files.map(file => {
    return `/uploads/projects/${file.filename}`;  
  });
  console.log("Image URLs being saved:", imageUrls);
} else {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Parse features
    let features = [];
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features);
      } catch (e) {
        if (typeof req.body.features === 'string') {
          if (req.body.features.includes(',')) {
            features = req.body.features.split(',').map(f => f.trim());
          } else {
            features = [req.body.features];
          }
        }
      }
    }

    // Parse amenities
    let amenities = [];
    if (req.body.amenities) {
      try {
        amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        if (typeof req.body.amenities === 'string') {
          if (req.body.amenities.includes(',')) {
            amenities = req.body.amenities.split(',').map(a => a.trim());
          } else {
            amenities = [req.body.amenities];
          }
        }
      }
    }

    // Parse nearbyPlaces
    let nearbyPlaces = [];
    if (req.body.nearbyPlaces) {
      try {
        nearbyPlaces = JSON.parse(req.body.nearbyPlaces);
      } catch (e) {
        console.error("Error parsing nearbyPlaces:", e);
      }
    }

    // Validate numeric fields
    const price = parseFloat(req.body.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: "Valid price is required" });
    }

    const area = parseFloat(req.body.area);
    if (isNaN(area) || area <= 0) {
      return res.status(400).json({ message: "Valid area is required" });
    }

    const projectData = {
      // Basic Info
      name: req.body.name?.trim(),
      tagline: req.body.tagline?.trim(),
      description: req.body.description?.trim(),
      price: price,
      pricePerSqFt: req.body.pricePerSqFt ? parseFloat(req.body.pricePerSqFt) : null,
      location: req.body.location?.trim(),
      city: req.body.city?.trim(),
      state: req.body.state?.trim(),
      pincode: req.body.pincode?.trim(),
      landmark: req.body.landmark?.trim(),
      
      // Project Details
      projectType: req.body.projectType || "Apartment",
      status: req.body.status || "ongoing",
      totalUnits: req.body.totalUnits ? parseInt(req.body.totalUnits) : 0,
      availableUnits: req.body.availableUnits ? parseInt(req.body.availableUnits) : 0,
      totalTowers: req.body.totalTowers ? parseInt(req.body.totalTowers) : 0,
      floorsPerTower: req.body.floorsPerTower ? parseInt(req.body.floorsPerTower) : 0,
      possessionDate: req.body.possessionDate || null,
      possessionStatus: req.body.possessionStatus || "ready",
      reraNumber: req.body.reraNumber?.trim() || "",
      reraApproved: req.body.reraApproved === 'true' || req.body.reraApproved === true,
      
      // Unit Details
      bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : 2,
      bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : 2,
      balconies: req.body.balconies ? parseInt(req.body.balconies) : 1,
      area: area,
      carpetArea: req.body.carpetArea ? parseFloat(req.body.carpetArea) : null,
      superArea: req.body.superArea ? parseFloat(req.body.superArea) : null,
      floorPlan: req.body.floorPlan || "",
      
      // Dimensions
      length: req.body.length ? parseFloat(req.body.length) : null,
      breadth: req.body.breadth ? parseFloat(req.body.breadth) : null,
      ceilingHeight: req.body.ceilingHeight ? parseFloat(req.body.ceilingHeight) : null,
      facing: req.body.facing || "East",
      
      // Pricing Breakdown
      basePrice: req.body.basePrice ? parseFloat(req.body.basePrice) : null,
      floorRise: req.body.floorRise ? parseFloat(req.body.floorRise) : null,
      parkingPrice: req.body.parkingPrice ? parseFloat(req.body.parkingPrice) : null,
      maintenance: req.body.maintenance ? parseFloat(req.body.maintenance) : null,
      maintenanceFrequency: req.body.maintenanceFrequency || "monthly",
      stampDuty: req.body.stampDuty ? parseFloat(req.body.stampDuty) : null,
      registration: req.body.registration ? parseFloat(req.body.registration) : null,
      gst: req.body.gst ? parseFloat(req.body.gst) : null,
      
      // Dates
      launchDate: req.body.launchDate || null,
      completionDate: req.body.completionDate || null,
      handoverDate: req.body.handoverDate || null,
      
      // Legal
      landArea: req.body.landArea ? parseFloat(req.body.landArea) : null,
      landOwnership: req.body.landOwnership || "freehold",
      approvalAuthority: req.body.approvalAuthority?.trim(),
      approvalNumber: req.body.approvalNumber?.trim(),
      approvalDate: req.body.approvalDate || null,
      
      // Developer
      developerName: req.body.developerName?.trim(),
      developerExperience: req.body.developerExperience ? parseInt(req.body.developerExperience) : null,
      completedProjects: req.body.completedProjects ? parseInt(req.body.completedProjects) : null,
      awards: req.body.awards?.trim(),
      
      // Construction
      constructionQuality: req.body.constructionQuality?.trim(),
      constructionType: req.body.constructionType || "RCC",
      projectArchitect: req.body.projectArchitect?.trim(),
      
      // Arrays
      features: features,
      amenities: amenities,
      nearbyPlaces: nearbyPlaces,
      
      // Media
      videoUrl: req.body.videoUrl?.trim(),
      brochureUrl: req.body.brochureUrl?.trim(),
      virtualTourUrl: req.body.virtualTourUrl?.trim(),
      
      // Builder
      builder: req.user._id,
      images: imageUrls,
    };
    
    console.log("Creating project with data keys:", Object.keys(projectData));
    console.log("Sample data:", {
      name: projectData.name,
      price: projectData.price,
      location: projectData.location,
      bedrooms: projectData.bedrooms,
      bathrooms: projectData.bathrooms,
      area: projectData.area,
      developerName: projectData.developerName
    });

    const requiredFields = ['name', 'description', 'price', 'location', 'area'];
    const missingFields = requiredFields.filter(field => !projectData[field]);
    
    if (missingFields.length > 0) {
      // Clean up uploaded images if validation fails
      if (imageUrls.length > 0) {
        imageUrls.forEach(imagePath => {
          const filename = path.basename(imagePath);
          const fullPath = path.join(__dirname, '../../uploads/projects', filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      
      return res.status(400).json({ 
        message: "Missing required fields", 
        fields: missingFields 
      });
    }

    const project = await Project.create(projectData);
    console.log("Project created successfully with ID:", project._id);
    
    res.status(201).json(project);
    
  } catch (error) {
    console.error("=== ERROR CREATING PROJECT ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Clean up uploaded images if project creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fullPath = path.join(__dirname, '../../uploads/projects', file.filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: "Validation error", 
        errors: errors 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to create project",
      error: error.message 
    });
  }
};

const getProject = async (req, res) => {
  try {
    console.log("Fetching project with ID:", req.params.id);
    console.log("User role:", req.user.role);
    console.log("User ID:", req.user._id);
    
    const project = await Project.findById(req.params.id)
      .populate('builder', 'name email profilePic city phone companyName bio')
      .populate('seller', 'name email phone city');

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: "Project not found" 
      });
    }

    // If user is the builder, return full project details
    if (project.builder && project.builder._id.toString() === req.user._id.toString()) {
      console.log("User is the builder, returning full details");
      return res.json({
        success: true,
        project,
        isOwner: true
      });
    }

    // For sellers and buyers, return limited public info
    console.log("User is not builder, returning limited public info");
    return res.json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        price: project.price,
        location: project.location,
        city: project.city,
        area: project.area,
        bedrooms: project.bedrooms,
        bathrooms: project.bathrooms,
        images: project.images,
        status: project.status,
        amenities: project.amenities,
        features: project.features,
        builder: project.builder,
        possessionDate: project.possessionDate,
        completionDate: project.completionDate,
        reraNumber: project.reraNumber,
        totalUnits: project.totalUnits,
        availableUnits: project.availableUnits,
        createdAt: project.createdAt
      },
      isOwner: false
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    let imageUrls = project.images || [];

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/projects/${file.filename}`);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Handle images to delete
    if (req.body.deleteImages) {
      try {
        const imagesToDelete = JSON.parse(req.body.deleteImages);
        
        // Delete files from filesystem
        imagesToDelete.forEach(imagePath => {
          const filename = path.basename(imagePath);
          const fullPath = path.join(__dirname, '../../uploads/projects', filename);
          
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Deleted image: ${fullPath}`);
          }
        });
        
        imageUrls = imageUrls.filter(url => !imagesToDelete.includes(url));
        
      } catch (e) {
        console.error("Error parsing deleteImages:", e);
      }
    }

    // Parse features and amenities
    let features = project.features;
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features);
      } catch (e) {
        features = req.body.features.split(',').map(f => f.trim());
      }
    }

    let amenities = project.amenities;
    if (req.body.amenities) {
      try {
        amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        amenities = req.body.amenities.split(',').map(a => a.trim());
      }
    }

    // Validate numeric fields if provided
    let price = project.price;
    if (req.body.price) {
      price = parseFloat(req.body.price);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ message: "Valid price is required" });
      }
    }

    let area = project.area;
    if (req.body.area) {
      area = parseFloat(req.body.area);
      if (isNaN(area) || area <= 0) {
        return res.status(400).json({ message: "Valid area is required" });
      }
    }

    // Update project fields
    project.name = req.body.name?.trim() || project.name;
    project.description = req.body.description?.trim() || project.description;
    project.price = price;
    project.location = req.body.location?.trim() || project.location;
    project.projectType = req.body.projectType || project.projectType;
    project.status = req.body.status || project.status;
    project.totalUnits = req.body.totalUnits !== undefined ? parseInt(req.body.totalUnits) : project.totalUnits;
    project.availableUnits = req.body.availableUnits !== undefined ? parseInt(req.body.availableUnits) : project.availableUnits;
    project.bedrooms = req.body.bedrooms !== undefined ? parseInt(req.body.bedrooms) : project.bedrooms;
    project.bathrooms = req.body.bathrooms !== undefined ? parseInt(req.body.bathrooms) : project.bathrooms;
    project.area = area;
    project.floors = req.body.floors !== undefined ? parseInt(req.body.floors) : project.floors;
    project.possessionDate = req.body.possessionDate || project.possessionDate;
    project.reraNumber = req.body.reraNumber?.trim() || project.reraNumber;
    project.features = features;
    project.amenities = amenities;
    project.images = imageUrls;

    await project.save();

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: error.message });
  }
};


const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }


    // Delete images from filesystem
    if (project.images && project.images.length > 0) {
      project.images.forEach(imagePath => {
        const filename = path.basename(imagePath);
        const fullPath = path.join(__dirname, '../../uploads/projects', filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted image: ${fullPath}`);
        }
      });
    }

    await project.deleteOne();

    res.json({ 
      success: true,
      message: "Project deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add a new function to get project statistics
const getProjectStats = async (req, res) => {
  try {
    const stats = await Project.aggregate([
      { $match: { builder: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    const totalProjects = await Project.countDocuments({ builder: req.user._id });
    const totalValue = await Project.aggregate([
      { $match: { builder: req.user._id } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({
      stats,
      totalProjects,
      totalValue: totalValue[0]?.total || 0
    });
  } catch (error) {
    console.error("Error fetching project stats:", error);
    res.status(500).json({ message: error.message });
  }
};

const fetchProjectDetails = async () => {
  try {
    setIsLoading(true);
    let projectData;
    
    try {
      // For sellers viewing public projects
      const { data } = await API.get(`/builder/all/${id}`);
      projectData = data;
    } catch (error) {
      if (error.response?.status === 403) {
        // If 403, maybe this is the builder's own project
        const { data } = await API.get(`/builder/my/${id}`);
        projectData = data;
      } else {
        throw error;
      }
    }
    
    setProject(projectData);
  } catch (error) {
    console.error("Error fetching project details:", error);
    toast.error(error.response?.data?.message || "Failed to load project details");
    
    if (error.response?.status === 403) {
      toast.error("You don't have permission to view this project");
    } else if (error.response?.status === 404) {
      toast.error("Project not found");
    }
  } finally {
    setIsLoading(false);
  }
};

const getAllProjects = async (req, res) => {
  console.log("=== getAllProjects called ===");
  console.log("User role:", req.user?.role);
  console.log("User ID:", req.user?._id);
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Show all projects that are not archived
    let filter = { status: { $ne: "archived" } };
    
    console.log("Filter:", filter);
    
    const projects = await Project.find(filter)
      .populate('builder', 'name email profilePic city phone companyName bio')
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);
      
    const total = await Project.countDocuments(filter);
    
    console.log(`Found ${projects.length} projects out of ${total} total`);
    
    res.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch projects",
      error: error.message 
    });
  }
};

// Add this function to get public project details
const getPublicProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('builder', 'name email profilePic city phone companyName bio');

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: "Project not found" 
      });
    }

    // Return limited info for public view (for sellers and buyers)
    res.json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        price: project.price,
        location: project.location,
        city: project.city,
        area: project.area,
        bedrooms: project.bedrooms,
        bathrooms: project.bathrooms,
        images: project.images,
        status: project.status,
        amenities: project.amenities,
        features: project.features,
        builder: project.builder,
        possessionDate: project.possessionDate,
        completionDate: project.completionDate,
        reraNumber: project.reraNumber,
        totalUnits: project.totalUnits,
        availableUnits: project.availableUnits,
        createdAt: project.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching public project:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getMyProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getAllProjects,
  fetchProjectDetails,
  getPublicProject
};