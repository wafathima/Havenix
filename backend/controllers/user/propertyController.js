const Property = require("../../models/Property");
const cloudinary = require("../../config/cloudinary");

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    let imageUrls = [];
    let roomImageUrls = {
      exterior: [],
      bedroom: [],
      bathroom: [],
      livingRoom: [],
      diningRoom: [],
      kitchen: []
    };

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "properties" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        imageUrls.push(result.secure_url);
      }

      if (req.body.roomTypes) {
        const roomTypes = JSON.parse(req.body.roomTypes);
        
        imageUrls.forEach((url, index) => {
          const roomType = roomTypes[index] || 'exterior';
          if (roomImageUrls[roomType]) {
            roomImageUrls[roomType].push(url);
          }
        });
      } else {
        roomImageUrls.exterior = imageUrls;
      }
    }

    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      location: req.body.location,
      seller: req.user._id,
      images: imageUrls,
      roomImages: roomImageUrls,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      area: req.body.area,
      type: req.body.type,
      status: req.body.status || "available",
      features: req.body.features ? JSON.parse(req.body.features) : [],
      floor: req.body.floor,
      totalFloors: req.body.totalFloors,
      furnished: req.body.furnished,
      yearBuilt: req.body.yearBuilt,
      parking: req.body.parking,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllProperties = async (req, res) => {
  try {
   
    const properties = await Property.find({
      $or: [
        { seller: { $exists: true, $ne: null } },
        { 
          builder: { $exists: true, $ne: null },
          status: "available" 
        }
      ]
    })
      .populate("seller", "name email profilePic")
      .populate("builder", "name email companyName profilePic city phone")
      .sort("-createdAt");

    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: error.message });
  }
};


const getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("seller", "name email profilePic")
      .populate("builder", "name email companyName profilePic city phone")
      .populate("owner", "name email role");

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    // Increment view count
    property.views = (property.views || 0) + 1;
    await property.save();

    res.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    // Check if seller owns this property
    if (property.seller && property.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    
    // Check if builder owns this property
    if (property.builder && property.builder.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    let imageUrls = property.images || [];
    let roomImageUrls = property.roomImages || {
      exterior: [], bedroom: [], bathroom: [], livingRoom: [], diningRoom: [], kitchen: []
    };

    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "properties" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        newImageUrls.push(result.secure_url);
      }

      imageUrls = [...imageUrls, ...newImageUrls];

      if (req.body.newRoomTypes) {
        const newRoomTypes = JSON.parse(req.body.newRoomTypes);
        newImageUrls.forEach((url, index) => {
          const roomType = newRoomTypes[index] || 'exterior';
          if (roomImageUrls[roomType]) {
            roomImageUrls[roomType].push(url);
          }
        });
      } else {
        roomImageUrls.exterior = [...roomImageUrls.exterior, ...newImageUrls];
      }
    }

    // Delete images if specified
    if (req.body.deleteImages) {
      const imagesToDelete = JSON.parse(req.body.deleteImages);
      imageUrls = imageUrls.filter(url => !imagesToDelete.includes(url));
      
      // Also remove from roomImages
      Object.keys(roomImageUrls).forEach(room => {
        roomImageUrls[room] = roomImageUrls[room].filter(url => !imagesToDelete.includes(url));
      });
    }

    // Update property fields
    property.title = req.body.title || property.title;
    property.description = req.body.description || property.description;
    property.price = req.body.price || property.price;
    property.location = req.body.location || property.location;
    property.images = imageUrls;
    property.roomImages = roomImageUrls;
    property.bedrooms = req.body.bedrooms || property.bedrooms;
    property.bathrooms = req.body.bathrooms || property.bathrooms;
    property.area = req.body.area || property.area;
    property.type = req.body.type || property.type;
    property.status = req.body.status || property.status;
    property.features = req.body.features ? JSON.parse(req.body.features) : property.features;
    property.floor = req.body.floor || property.floor;
    property.totalFloors = req.body.totalFloors || property.totalFloors;
    property.furnished = req.body.furnished || property.furnished;
    property.yearBuilt = req.body.yearBuilt || property.yearBuilt;
    property.parking = req.body.parking || property.parking;

    await property.save();

    res.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    // Check if seller owns this property
    if (property.seller && property.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    
    // Check if builder owns this property
    if (property.builder && property.builder.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await property.deleteOne();

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getMyProperties   
};