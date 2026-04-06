const Property = require("../../models/Property");
const fs = require('fs');
const path = require('path');

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id }).sort("-createdAt");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createProperty = async (req, res) => {
  try {
    console.log("=== CREATE PROPERTY DEBUG ===");
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
      if (typeof req.body.features === 'string') {
        try {
          features = JSON.parse(req.body.features);
          console.log("Parsed features from JSON:", features);
        } catch (e) {
          if (req.body.features.includes(',')) {
            features = req.body.features.split(',').map(f => f.trim());
            console.log("Split features from comma string:", features);
          } else {
            features = [req.body.features];
            console.log("Single feature:", features);
          }
        }
      } else if (Array.isArray(req.body.features)) {
        features = req.body.features;
        console.log("Features is already an array:", features);
      }
    }

    const propertyData = {
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
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
      features: features,
      seller: req.user._id,
      images: imageUrls,
    };
    
    console.log("Creating property with data:", JSON.stringify(propertyData, null, 2));

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
    console.log("Images saved:", property.images);
    
    res.status(201).json(property);
    
  } catch (error) {
    console.error("=== ERROR CREATING PROPERTY ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
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

    if (property.seller.toString() !== req.user._id.toString()) {
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
    console.log("=== UPDATE PROPERTY DEBUG ===");
    console.log("Property ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log("Files received:", req.files ? req.files.length : 0);
    
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    let imageUrls = property.images || [];

    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      imageUrls = [...imageUrls, ...newImageUrls];
      console.log("New images added:", newImageUrls);
    }

    if (req.body.deleteImages) {
      try {
        const imagesToDelete = JSON.parse(req.body.deleteImages);
        console.log("Images to delete:", imagesToDelete);
        
        const fs = require('fs');
        const path = require('path');
        
        imagesToDelete.forEach(imagePath => {
          const filename = path.basename(imagePath);
          const fullPath = path.join(__dirname, '../../uploads/properties', filename);
          
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

    if (req.body.existingImages) {
      try {
        const existingImagesFromForm = JSON.parse(req.body.existingImages);
        
        console.log("Existing images from form:", existingImagesFromForm);
      } catch (e) {
        console.error("Error parsing existingImages:", e);
      }
    }

    let features = property.features;
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features);
        console.log("Parsed features:", features);
      } catch (e) {
        console.log("Features parsing error, trying as string:", e.message);
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

    await property.save();
    console.log("Property updated successfully:", property._id);

    res.json(property);
  } catch (error) {
    console.error("=== ERROR UPDATING PROPERTY ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
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

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    if (property.images && property.images.length > 0) {
      property.images.forEach(imagePath => {
        const filename = path.basename(imagePath);
        const fullPath = path.join(__dirname, '../../uploads/properties', filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted image: ${fullPath}`);
        }
      });
    }

    await property.deleteOne();

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add this new function to propertyController.js
const updatePurchasedProperty = async (req, res) => {
  try {
    console.log("=== UPDATE PURCHASED PROPERTY DEBUG ===");
    console.log("Property ID:", req.params.id);
    console.log("Request body:", req.body);
    
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the current user is the owner (purchaser) of this property
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to edit this property. Only the owner can edit purchased properties." 
      });
    }

    // Fields that seller can edit for purchased properties
    const editableFields = [
      'title', 'description', 'price', 'location', 'type', 'status',
      'bedrooms', 'bathrooms', 'area', 'floor', 'totalFloors', 
      'furnished', 'yearBuilt', 'parking', 'features'
    ];

    // Update only allowed fields
    editableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        switch (field) {
          case 'price':
          case 'area':
            property[field] = parseFloat(req.body[field]);
            break;
          case 'bedrooms':
          case 'bathrooms':
          case 'floor':
          case 'totalFloors':
          case 'yearBuilt':
          case 'parking':
            property[field] = parseInt(req.body[field]);
            break;
          case 'features':
            if (typeof req.body.features === 'string') {
              try {
                property.features = JSON.parse(req.body.features);
              } catch (e) {
                property.features = req.body.features.split(',').map(f => f.trim());
              }
            } else if (Array.isArray(req.body.features)) {
              property.features = req.body.features;
            }
            break;
          default:
            property[field] = req.body[field];
        }
      }
    });

    // Handle image updates for purchased properties
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      property.images = [...(property.images || []), ...newImageUrls];
    }

    // Handle image deletions
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
        property.images = property.images.filter(url => !imagesToDelete.includes(url));
      } catch (e) {
        console.error("Error parsing deleteImages:", e);
      }
    }

    await property.save();
    console.log("Purchased property updated successfully:", property._id);

    res.json({ 
      success: true, 
      message: "Property updated successfully", 
      property 
    });
    
  } catch (error) {
    console.error("=== ERROR UPDATING PURCHASED PROPERTY ===");
    console.error("Error message:", error.message);
    
    res.status(500).json({ 
      success: false,
      message: "Failed to update property",
      error: error.message 
    });
  }
};

module.exports = {
  getMyProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePurchasedProperty 
};

