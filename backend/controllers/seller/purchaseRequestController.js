const PurchaseRequest = require("../../models/PurchaseRequest");
const Property = require("../../models/Property");
const Notification = require("../../models/Notification");
const { createNotification } = require('../../controllers/user/notificationController');



const createPurchaseRequest = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    const sellerId = req.user._id;

    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (property.status !== "available") {
      return res.status(400).json({ message: "Property is not available for purchase" });
    }
    
    if (!property.builder) {
      return res.status(400).json({ message: "This property cannot be purchased from a builder" });
    }

    const existingRequest = await PurchaseRequest.findOne({
      property: propertyId,
      seller: sellerId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending request for this property" });
    }

    const purchaseRequest = await PurchaseRequest.create({
      property: propertyId,
      builder: property.builder,
      seller: sellerId,
      message: message || ""
    });

    await createNotification(
      property.builder, 
      sellerId,        
      "purchase_request", 
      "New Purchase Request", 
      `${req.user.name || 'A seller'} wants to purchase "${property.title}"`, 
      { 
        propertyId: property._id,
        purchaseRequestId: purchaseRequest._id,
        propertyTitle: property.title 
      }
    );

    res.status(201).json({
      success: true,
      message: "Purchase request sent to builder",
      request: purchaseRequest
    });

  } catch (error) {
    console.error("Error creating purchase request:", error);
    res.status(500).json({ message: error.message });
  }
};

const getBuilderPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find({ builder: req.user._id })
      .populate('property', 'title price location images')
      .populate('seller', 'name email')
      .sort("-createdAt");
    
    res.json(requests);
  } catch (error) {
    console.error("Error fetching purchase requests:", error);
    res.status(500).json({ message: error.message });
  }
};

const getSellerPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find({ seller: req.user._id })
      .populate('property', 'title price location images')
      .populate('builder', 'name email')
      .sort("-createdAt");
    
    res.json(requests);
  } catch (error) {
    console.error("Error fetching seller requests:", error);
    res.status(500).json({ message: error.message });
  }
};


const acceptPurchaseRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await PurchaseRequest.findById(requestId)
      .populate('property')
      .populate('seller');
    
    if (!request) {
      return res.status(404).json({ message: "Purchase request not found" });
    }
    
    if (request.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }
    
    const property = request.property;
    
    if (property.status !== "available") {
      return res.status(400).json({ message: "Property is no longer available" });
    }
    
    property.owner = request.seller._id;
    property.purchasedBy = request.seller._id;
    property.purchasedAt = new Date();
    property.status = "sold";
    property.seller = request.seller._id;
    
    await property.save();
    
    request.status = "accepted";
    request.respondedAt = new Date();
    await request.save();
    
    await createNotification(
      request.seller._id, 
      req.user._id,       
      "purchase_accepted", 
      "Purchase Request Accepted!", 
      `Your request to purchase "${property.title}" has been accepted by ${req.user.name || 'the builder'}.`, 
      { 
        propertyId: property._id,
        purchaseRequestId: request._id,
        propertyTitle: property.title 
      } 
    );
    
    res.json({
      success: true,
      message: "Purchase request accepted. Property transferred to seller.",
      property
    });
    
  } catch (error) {
    console.error("Error accepting purchase request:", error);
    res.status(500).json({ message: error.message });
  }
};

const rejectPurchaseRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await PurchaseRequest.findById(requestId)
      .populate('property');
    
    if (!request) {
      return res.status(404).json({ message: "Purchase request not found" });
    }
    
    if (request.builder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }
    
    request.status = "rejected";
    request.respondedAt = new Date();
    await request.save();
    
    await createNotification(
      request.seller,     
      req.user._id,      
      "purchase_rejected", 
      "Purchase Request Declined",
      `Your request to purchase "${request.property.title}" was declined by ${req.user.name || 'the builder'}.`, // message
      { 
        propertyId: request.property._id,
        purchaseRequestId: request._id,
        propertyTitle: request.property.title 
      } 
    );
    
    res.json({
      success: true,
      message: "Purchase request rejected"
    });
    
  } catch (error) {
    console.error("Error rejecting purchase request:", error);
    res.status(500).json({ message: error.message });
  }
};

const createNotificationWithSocket = async (recipientId, senderId, type, title, message, data = {}, io) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      data
    });
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name profilePic role');
    
    if (io) {
      io.to(`user-${recipientId}`).emit('new_notification', populatedNotification);
      console.log(`📢 Notification emitted to user-${recipientId}: ${title}`);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  createPurchaseRequest,
  getBuilderPurchaseRequests,
  getSellerPurchaseRequests,
  acceptPurchaseRequest,
  rejectPurchaseRequest,
  createNotificationWithSocket
};