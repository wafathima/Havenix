const Property = require("../../models/Property");

const getAvailableProperties = async (req, res) => {
  try {
   
    const properties = await Property.find({ 
      status: "available",
      builder: { $exists: true, $ne: null },
      owner: { $ne: req.user._id } 
    }).populate('builder', 'name email').sort("-createdAt");
    
    res.json(properties);
  } catch (error) {
    console.error("Error fetching available properties:", error);
    res.status(500).json({ message: error.message });
  }
};

const getPurchasedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ 
      purchasedBy: req.user._id 
    }).sort("-purchasedAt");
    
    res.json(properties);
  } catch (error) {
    console.error("Error fetching purchased properties:", error);
    res.status(500).json({ message: error.message });
  }
};

const purchaseProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const sellerId = req.user._id;
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (property.status !== "available") {
      return res.status(400).json({ message: "Property is not available for purchase" });
    }
    
    // Check if property was listed by a builder
    if (!property.builder) {
      return res.status(400).json({ message: "This property cannot be purchased" });
    }
    
    property.owner = sellerId;
    property.purchasedBy = sellerId;
    property.purchasedAt = new Date();
    property.status = "sold";
    property.seller = sellerId; 
    
    await property.save();
    
    res.json({ 
      success: true, 
      message: "Property purchased successfully",
      property: property
    });
    
  } catch (error) {
    console.error("Error purchasing property:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableProperties,
  getPurchasedProperties,
  purchaseProperty
};