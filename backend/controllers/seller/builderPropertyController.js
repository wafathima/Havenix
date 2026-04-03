const Property = require("../../models/Property");

const getAvailableBuilderProperties = async (req, res) => {
  try {
   
    const properties = await Property.find({ 
      builder: { $exists: true, $ne: null },
      status: "available",
      purchasedBy: null
    })
    .populate('builder', 'name email companyName profilePic city phone')
    .sort("-createdAt");
    
    res.json(properties);
  } catch (error) {
    console.error("Error fetching builder properties for seller:", error);
    res.status(500).json({ message: error.message });
  }
};

const getBuilderProjects = async (req, res) => {
  try {
    const Project = require("../../models/Project");
    const projects = await Project.find({ 
      status: { $in: ["ongoing", "upcoming", "completed"] }
    })
    .populate('builder', 'name email companyName profilePic city phone')
    .sort("-createdAt");
    
    res.json(projects);
  } catch (error) {
    console.error("Error fetching builder projects:", error);
    res.status(500).json({ message: error.message });
  }
};

const getBuilderProject = async (req, res) => {
  try {
    const Project = require("../../models/Project");
    const project = await Project.findById(req.params.id)
      .populate('builder', 'name email companyName profilePic city phone');
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  } catch (error) {
    console.error("Error fetching builder project:", error);
    res.status(500).json({ message: error.message });
  }
};

const getBuilderProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('builder', 'name email companyName profilePic city phone');
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (!property.builder) {
      return res.status(403).json({ message: "This is not a builder property" });
    }
    
    res.json(property);
  } catch (error) {
    console.error("Error fetching builder property:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableBuilderProperties,
  getBuilderProjects,
  getBuilderProject,
  getBuilderProperty
};