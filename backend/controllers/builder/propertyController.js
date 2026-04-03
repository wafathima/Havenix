const Property = require("../../models/Property");
const fs = require('fs');
const path = require('path');

const getBuilderProperties = async (req, res) => {
  try {
    console.log("Fetching properties for builder:", req.user._id);
    const properties = await Property.find({ 
      builder: req.user._id 
    }).sort("-createdAt");
    
    console.log(`Found ${properties.length} properties for builder`);
    res.json(properties);
  } catch (error) {
    console.error("Error fetching builder properties:", error);
    res.status(500).json({ message: error.message });
  }
};


const createProperty = async (req, res) => {
  try {
    console.log("=== BUILDER CREATE PROPERTY DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Files received:", req.files ? req.files.length : 0);
    console.log("User ID:", req.user?._id);
    
    let imageUrls = [];
    
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => {
        return `/uploads/properties/${file.filename}`;
      });
      console.log("Image URLs being saved:", imageUrls);
    } else {
      return res.status(400).json({ message: "At least one image is required" });
    }

    let features = [];
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features);
      } catch (e) {
        if (typeof req.body.features === 'string') {
          if (req.body.features.includes(',')) {
            features = req.body.features.split(',').map(f => f.trim()).filter(f => f);
          } else if (req.body.features.trim()) {
            features = [req.body.features.trim()];
          }
        } else if (Array.isArray(req.body.features)) {
          features = req.body.features;
        }
      }
    }
    
    // Ensure features is an array of strings
    if (!Array.isArray(features)) {
      features = [];
    }
    
    // Filter out empty strings and ensure all are strings
    features = features.filter(f => f && typeof f === 'string');

    const propertyData = {
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      originalPrice: parseFloat(req.body.price),
      location: req.body.location,
      type: req.body.type || "Home",
      status: req.body.status || "available",
      bedrooms: parseInt(req.body.bedrooms) || 0,
      bathrooms: parseInt(req.body.bathrooms) || 0,
      area: parseFloat(req.body.area),
      floor: req.body.floor ? parseInt(req.body.floor) : 1,
      totalFloors: req.body.totalFloors ? parseInt(req.body.totalFloors) : 1,
      furnished: req.body.furnished || "Semi-Furnished",
      yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : null,
      parking: parseInt(req.body.parking) || 0,
      features: features, // Now this will be a proper array
      owner: req.user._id,
      createdBy: req.user._id,
      builder: req.user._id,
      images: imageUrls,
    };
    
    console.log("Creating property with features:", features);
    console.log("Features type:", typeof features, Array.isArray(features));
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'location', 'area'];
    const missingFields = requiredFields.filter(field => !propertyData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        fields: missingFields 
      });
    }

    const property = await Property.create(propertyData);
    console.log("Property created successfully with ID:", property._id);
    
    res.status(201).json(property);
    
  } catch (error) {
    console.error("=== ERROR CREATING PROPERTY ===");
    console.error("Error:", error);
    
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
      message: "Failed to create property",
      error: error.message 
    });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if builder owns this property
    if (property.builder && property.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this property" });
    }

    res.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    console.log("=== BUILDER UPDATE PROPERTY DEBUG ===");
    console.log("Property ID:", req.params.id);
    
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.builder && property.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    let imageUrls = property.images || [];

    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    if (req.body.deleteImages) {
      try {
        const imagesToDelete = JSON.parse(req.body.deleteImages);
        
        imagesToDelete.forEach(imagePath => {
          const filename = path.basename(imagePath);
          const fullPath = path.join(__dirname, '../../uploads/properties', filename);
          
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
        
        imageUrls = imageUrls.filter(url => !imagesToDelete.includes(url));
        
      } catch (e) {
        console.error("Error parsing deleteImages:", e);
      }
    }

    let features = property.features;
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

    property.title = req.body.title || property.title;
    property.description = req.body.description || property.description;
    property.price = req.body.price ? parseFloat(req.body.price) : property.price;
    property.location = req.body.location || property.location;
    property.type = req.body.type || property.type;
    property.status = req.body.status || property.status;
    property.bedrooms = req.body.bedrooms !== undefined ? parseInt(req.body.bedrooms) : property.bedrooms;
    property.bathrooms = req.body.bathrooms !== undefined ? parseInt(req.body.bathrooms) : property.bathrooms;
    property.area = req.body.area ? parseFloat(req.body.area) : property.area;
    property.floor = req.body.floor !== undefined ? parseInt(req.body.floor) : property.floor;
    property.totalFloors = req.body.totalFloors !== undefined ? parseInt(req.body.totalFloors) : property.totalFloors;
    property.furnished = req.body.furnished || property.furnished;
    property.yearBuilt = req.body.yearBuilt ? parseInt(req.body.yearBuilt) : property.yearBuilt;
    property.parking = req.body.parking !== undefined ? parseInt(req.body.parking) : property.parking;
    property.features = features;
    property.images = imageUrls;
    
    if (req.body.price && parseFloat(req.body.price) !== property.originalPrice) {
      property.originalPrice = parseFloat(req.body.price);
    }

    await property.save();
    console.log("Property updated successfully:", property._id);

    res.json(property);
  } catch (error) {
    console.error("=== ERROR UPDATING PROPERTY ===");
    console.error("Error:", error);
    
    res.status(500).json({ 
      message: "Failed to update property",
      error: error.message 
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.builder && property.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    if (property.purchasedBy) {
      property.isDeleted = true;
      property.deletedAt = new Date();
      property.deletedBy = req.user._id;
      property.status = 'deleted_by_builder';
      await property.save();
      
      res.json({ 
        message: "Property marked as deleted. It will still appear for the seller who purchased it.",
        property
      });
    } else {
      if (property.images && property.images.length > 0) {
        property.images.forEach(imagePath => {
          const filename = path.basename(imagePath);
          const fullPath = path.join(__dirname, '../../uploads/properties', filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      
      await property.deleteOne();
      res.json({ message: "Property deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBuilderProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
};