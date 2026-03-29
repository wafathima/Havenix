// const Enquiry = require("../../models/Enquiry");
// const ContactEnquiry = require("../../models/ContactEnquiry");
// const Property = require("../../models/Property");

// const getPropertyImage = (property) => {
//   if (!property) return null;
  
//   if (property.images && property.images.length > 0) {
//     return property.images[0];
//   }
  
//   if (property.image) {
//     return property.image;
//   }
  
//   return null;
// };

// const formatDate = (date) => {
//   if (!date) return "";
  
//   const now = new Date();
//   const past = new Date(date);
//   const diffTime = Math.abs(now - past);
//   const diffMinutes = Math.floor(diffTime / (1000 * 60));
//   const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
//   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
//   if (diffMinutes < 1) return 'Just now';
//   if (diffMinutes < 60) return `${diffMinutes} min ago`;
//   if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
//   if (diffDays === 1) return 'Yesterday';
//   if (diffDays < 7) return `${diffDays} days ago`;
//   return past.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// };

// const createContactEnquiry = async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     if (!name || !email || !message) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email and message are required"
//       });
//     }

//     const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid email address"
//       });
//     }

//     const contactEnquiry = await ContactEnquiry.create({
//       name,
//       email,
//       message,
//       user: req.user?._id || null,
//       status: "pending",
//       readByAdmin: false
//     });

//     console.log("✅ General contact enquiry saved:", contactEnquiry._id);

//     if (req.user) {
//       await Enquiry.create({
//         property: null,
//         buyer: req.user._id,
//         seller: null,
//         message: message,
//         status: "pending",
//         readByBuyer: true,
//         isGeneralEnquiry: true
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully! Our team will contact you soon."
//     });

//   } catch (error) {
//     console.error("❌ Error creating contact enquiry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error. Please try again later."
//     });
//   }
// };

// const createEnquiry = async (req, res) => {
//   try {
//     const { propertyId, message } = req.body;

//     if (!propertyId) {
//       return res.status(400).json({
//         success: false,
//         message: "Property ID is required"
//       });
//     }

//     if (!message) {
//       return res.status(400).json({
//         success: false,
//         message: "Message is required"
//       });
//     }

//     const property = await Property.findById(propertyId).populate("seller");
    
//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found"
//       });
//     }

//     if (property.seller._id.toString() === req.user._id.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot enquire about your own property"
//       });
//     }

//     const enquiry = await Enquiry.create({
//       property: propertyId,
//       buyer: req.user._id,
//       seller: property.seller._id,
//       message,
//       status: "pending",
//       readByBuyer: true,
//       readBySeller: false
//     });

//     const populatedEnquiry = await Enquiry.findById(enquiry._id)
//       .populate({
//         path: 'property',
//         select: 'title location price images image'
//       })
//       .populate({
//         path: 'buyer',
//         select: 'name email'
//       })
//       .populate({
//         path: 'seller',
//         select: 'name email phone'
//       });

//     res.status(201).json({
//       success: true,
//       message: "Enquiry sent successfully",
//       enquiry: populatedEnquiry
//     });

//   } catch (error) {
//     console.error("❌ Error creating enquiry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };


// const respondToEnquiry = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, response } = req.body;

//     if (!status || !['accepted', 'rejected'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid status is required"
//       });
//     }

//     const enquiry = await Enquiry.findById(id)
//       .populate('property', 'title')
//       .populate('buyer', 'name email');

//     if (!enquiry) {
//       return res.status(404).json({
//         success: false,
//         message: "Enquiry not found"
//       });
//     }

//     if (enquiry.seller.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized"
//       });
//     }

//     enquiry.status = status;
//     enquiry.sellerResponse = response || (status === 'accepted' 
//       ? "Your enquiry has been accepted. I will contact you soon."
//       : "Sorry, this property is no longer available.");
//     enquiry.responseDate = new Date();
//     enquiry.readBySeller = true;

//     await enquiry.save();

//     res.json({
//       success: true,
//       message: `Enquiry ${status}`,
//       enquiry: {
//         _id: enquiry._id,
//         status: enquiry.status,
//         sellerResponse: enquiry.sellerResponse,
//         responseDate: enquiry.responseDate
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error responding to enquiry:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// const getSellerContact = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const enquiry = await Enquiry.findById(id)
//       .populate('seller', 'name email phone');

//     if (!enquiry) {
//       return res.status(404).json({
//         success: false,
//         message: "Enquiry not found"
//       });
//     }

//     if (enquiry.buyer.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized"
//       });
//     }

//     if (enquiry.status !== 'accepted') {
//       return res.status(403).json({
//         success: false,
//         message: "Seller contact details are only available for accepted enquiries"
//       });
//     }

//     res.json({
//       success: true,
//       seller: {
//         name: enquiry.seller.name,
//         email: enquiry.seller.email,
//         phone: enquiry.seller.phone
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error fetching seller contact:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// const getBuyerEnquiries = async (req, res) => {
//   try {
//     const enquiries = await Enquiry.find({ buyer: req.user._id })
//       .populate({
//         path: 'property',
//         select: 'title location price images image'
//       })
//       .populate({
//         path: 'seller',
//         select: 'name email phone'
//       })
//       .sort("-createdAt");

//     const formattedEnquiries = enquiries.map(enquiry => {
//       const enquiryObj = enquiry.toObject();
      
//       // Get image
//       let image = null;
//       if (enquiryObj.property) {
//         image = getPropertyImage(enquiryObj.property);
//       }
      
//       return {
//         ...enquiryObj,
//         property: enquiryObj.property ? {
//           ...enquiryObj.property,
//           image: image
//         } : null,
//         timeAgo: formatDate(enquiryObj.createdAt),
//         responseTimeAgo: enquiryObj.responseDate ? formatDate(enquiryObj.responseDate) : null,
//         seller: enquiryObj.status === 'accepted' ? enquiryObj.seller : {
//           name: enquiryObj.seller?.name,
//           email: null,
//           phone: null
//         }
//       };
//     });

//     res.json({
//       success: true,
//       enquiries: formattedEnquiries
//     });

//   } catch (error) {
//     console.error("❌ Error fetching buyer enquiries:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch enquiries"
//     });
//   }
// };

// const getSellerEnquiries = async (req, res) => {
//   try {
//     const enquiries = await Enquiry.find({ seller: req.user._id })
//       .populate({
//         path: 'property',
//         select: 'title location price images image'
//       })
//       .populate({
//         path: 'buyer',
//         select: 'name email'
//       })
//       .sort("-createdAt");

//     const formattedEnquiries = enquiries.map(enquiry => {
//       const enquiryObj = enquiry.toObject();
      
//       let image = null;
//       if (enquiryObj.property) {
//         image = getPropertyImage(enquiryObj.property);
//       }
      
//       return {
//         ...enquiryObj,
//         property: enquiryObj.property ? {
//           ...enquiryObj.property,
//           image: image
//         } : null,
//         timeAgo: formatDate(enquiryObj.createdAt),
//         responseTimeAgo: enquiryObj.responseDate ? formatDate(enquiryObj.responseDate) : null
//       };
//     });

//     res.json({
//       success: true,
//       enquiries: formattedEnquiries
//     });

//   } catch (error) {
//     console.error("❌ Error fetching seller enquiries:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch enquiries"
//     });
//   }
// };

// const markAsRead = async (req, res) => {
//   try {
//     const enquiry = await Enquiry.findById(req.params.id);
    
//     if (!enquiry) {
//       return res.status(404).json({
//         success: false,
//         message: "Enquiry not found"
//       });
//     }

//     if (enquiry.buyer.toString() === req.user._id.toString()) {
//       enquiry.readByBuyer = true;
//     } else if (enquiry.seller.toString() === req.user._id.toString()) {
//       enquiry.readBySeller = true;
//     }

//     await enquiry.save();
    
//     res.json({
//       success: true,
//       message: "Enquiry marked as read"
//     });

//   } catch (error) {
//     console.error("❌ Error marking enquiry as read:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// module.exports = {
//   createEnquiry,
//   getBuyerEnquiries,
//   getSellerEnquiries,
//   markAsRead,
//   createContactEnquiry,
//   respondToEnquiry,     
//   getSellerContact       
// };

const Enquiry = require("../../models/Enquiry");
const ContactEnquiry = require("../../models/ContactEnquiry");
const Property = require("../../models/Property");
const { createNotification } = require("../../controllers/user/notificationController");

const getPropertyImage = (property) => {
  if (!property) return null;
  
  if (property.images && property.images.length > 0) {
    return property.images[0];
  }
  
  if (property.image) {
    return property.image;
  }
  
  return null;
};

const formatDate = (date) => {
  if (!date) return "";
  
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now - past);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return past.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const createContactEnquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required"
      });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    const contactEnquiry = await ContactEnquiry.create({
      name,
      email,
      message,
      user: req.user?._id || null,
      status: "pending",
      readByAdmin: false
    });

    console.log("✅ General contact enquiry saved:", contactEnquiry._id);

    if (req.user) {
      await Enquiry.create({
        property: null,
        buyer: req.user._id,
        seller: null,
        message: message,
        status: "pending",
        readByBuyer: true,
        isGeneralEnquiry: true
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully! Our team will contact you soon."
    });

  } catch (error) {
    console.error("❌ Error creating contact enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

const createEnquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required"
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const property = await Property.findById(propertyId).populate("seller");
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (property.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot enquire about your own property"
      });
    }

    const enquiry = await Enquiry.create({
      property: propertyId,
      buyer: req.user._id,
      seller: property.seller._id,
      message,
      status: "pending",
      readByBuyer: true,
      readBySeller: false
    });

    // Create notification for seller
    await createNotification(
      property.seller._id, // recipient (seller)
      req.user._id, // sender (buyer)
      'enquiry',
      'New Enquiry Received',
      `${req.user.name} is interested in your property "${property.title}"`,
      { 
        enquiryId: enquiry._id, 
        url: `/seller/enquiries/${enquiry._id}` 
      }
    );

    const populatedEnquiry = await Enquiry.findById(enquiry._id)
      .populate({
        path: 'property',
        select: 'title location price images image'
      })
      .populate({
        path: 'buyer',
        select: 'name email'
      })
      .populate({
        path: 'seller',
        select: 'name email phone'
      });

    res.status(201).json({
      success: true,
      message: "Enquiry sent successfully",
      enquiry: populatedEnquiry
    });

  } catch (error) {
    console.error("❌ Error creating enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const respondToEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required"
      });
    }

    const enquiry = await Enquiry.findById(id)
      .populate('property', 'title')
      .populate('buyer', 'name email')
      .populate('seller', 'name');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    if (enquiry.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    enquiry.status = status;
    enquiry.sellerResponse = response || (status === 'accepted' 
      ? "Your enquiry has been accepted. I will contact you soon."
      : "Sorry, this property is no longer available.");
    enquiry.responseDate = new Date();
    enquiry.readBySeller = true;

    await enquiry.save();

    // Create notification for buyer based on status
    const notificationType = status === 'accepted' ? 'enquiry_accepted' : 'enquiry_rejected';
    const notificationTitle = status === 'accepted' ? 'Enquiry Accepted' : 'Enquiry Rejected';
    const notificationMessage = status === 'accepted'
      ? `${enquiry.seller.name} has accepted your enquiry for "${enquiry.property.title}"`
      : `${enquiry.seller.name} has responded to your enquiry for "${enquiry.property.title}"`;

    await createNotification(
      enquiry.buyer._id, // recipient (buyer)
      req.user._id, // sender (seller)
      notificationType,
      notificationTitle,
      notificationMessage,
      { 
        enquiryId: enquiry._id, 
        url: `/buyer/enquiries/${enquiry._id}` 
      }
    );

    res.json({
      success: true,
      message: `Enquiry ${status}`,
      enquiry: {
        _id: enquiry._id,
        status: enquiry.status,
        sellerResponse: enquiry.sellerResponse,
        responseDate: enquiry.responseDate
      }
    });

  } catch (error) {
    console.error("❌ Error responding to enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getSellerContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const enquiry = await Enquiry.findById(id)
      .populate('seller', 'name email phone');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    if (enquiry.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    if (enquiry.status !== 'accepted') {
      return res.status(403).json({
        success: false,
        message: "Seller contact details are only available for accepted enquiries"
      });
    }

    res.json({
      success: true,
      seller: {
        name: enquiry.seller.name,
        email: enquiry.seller.email,
        phone: enquiry.seller.phone
      }
    });

  } catch (error) {
    console.error("❌ Error fetching seller contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getBuyerEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ buyer: req.user._id })
      .populate({
        path: 'property',
        select: 'title location price images image'
      })
      .populate({
        path: 'seller',
        select: 'name email phone'
      })
      .sort("-createdAt");

    const formattedEnquiries = enquiries.map(enquiry => {
      const enquiryObj = enquiry.toObject();
      
      // Get image
      let image = null;
      if (enquiryObj.property) {
        image = getPropertyImage(enquiryObj.property);
      }
      
      return {
        ...enquiryObj,
        property: enquiryObj.property ? {
          ...enquiryObj.property,
          image: image
        } : null,
        timeAgo: formatDate(enquiryObj.createdAt),
        responseTimeAgo: enquiryObj.responseDate ? formatDate(enquiryObj.responseDate) : null,
        seller: enquiryObj.status === 'accepted' ? enquiryObj.seller : {
          name: enquiryObj.seller?.name,
          email: null,
          phone: null
        }
      };
    });

    res.json({
      success: true,
      enquiries: formattedEnquiries
    });

  } catch (error) {
    console.error("❌ Error fetching buyer enquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries"
    });
  }
};

const getSellerEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ seller: req.user._id })
      .populate({
        path: 'property',
        select: 'title location price images image'
      })
      .populate({
        path: 'buyer',
        select: 'name email'
      })
      .sort("-createdAt");

    const formattedEnquiries = enquiries.map(enquiry => {
      const enquiryObj = enquiry.toObject();
      
      let image = null;
      if (enquiryObj.property) {
        image = getPropertyImage(enquiryObj.property);
      }
      
      return {
        ...enquiryObj,
        property: enquiryObj.property ? {
          ...enquiryObj.property,
          image: image
        } : null,
        timeAgo: formatDate(enquiryObj.createdAt),
        responseTimeAgo: enquiryObj.responseDate ? formatDate(enquiryObj.responseDate) : null
      };
    });

    res.json({
      success: true,
      enquiries: formattedEnquiries
    });

  } catch (error) {
    console.error("❌ Error fetching seller enquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries"
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    if (enquiry.buyer.toString() === req.user._id.toString()) {
      enquiry.readByBuyer = true;
    } else if (enquiry.seller.toString() === req.user._id.toString()) {
      enquiry.readBySeller = true;
    }

    await enquiry.save();
    
    res.json({
      success: true,
      message: "Enquiry marked as read"
    });

  } catch (error) {
    console.error("❌ Error marking enquiry as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createEnquiry,
  getBuyerEnquiries,
  getSellerEnquiries,
  markAsRead,
  createContactEnquiry,
  respondToEnquiry,     
  getSellerContact       
};