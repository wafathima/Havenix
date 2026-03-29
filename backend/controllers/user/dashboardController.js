const Property = require("../../models/Property");
const Enquiry = require("../../models/Enquiry");
const Chat = require("../../models/Chat");

exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;

    // SELLER
    if (user.role === "seller") {
      const properties = await Property.find({ seller: user._id })
        .select('title location price status images createdAt')
        .sort({ createdAt: -1 });

      const propertyIds = properties.map(p => p._id);
      const enquiries = await Enquiry.find({ 
        property: { $in: propertyIds } 
      })
      .populate('buyer', 'name email')
      .populate('property', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

      return res.json({
        success: true,
        role: "seller",
        stats: {
          totalProperties: properties.length,
          activeListings: properties.filter(p => p.status === 'available').length,
          soldProperties: properties.filter(p => p.status === 'sold').length,
          totalEnquiries: enquiries.length
        },
        properties,
        recentEnquiries: enquiries
      });
    }

    // BUILDER
    if (user.role === "builder") {
      const Project = require("../../models/Project");
      const projects = await Project.find({ builder: user._id })
        .select('name location price status images createdAt')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        role: "builder",
        stats: {
          totalProjects: projects.length,
          ongoingProjects: projects.filter(p => p.status === 'ongoing').length,
          completedProjects: projects.filter(p => p.status === 'completed').length
        },
        projects
      });
    }

    // BUYER 
    if (user.role === "buyer") {
      const enquiries = await Enquiry.find({ buyer: user._id })
        .populate('property', 'title location price images')
        .populate('seller', 'name email phone')
        .sort({ createdAt: -1 });

      const chats = await Chat.find({ 
        participants: user._id 
      })
      .populate('participants', 'name email role')
      .populate('property', 'title images price')
      .sort({ lastMessageAt: -1 });

      const savedProperties = await Property.find({ 
        savedBy: user._id 
      })
      .select('title location price images')
      .sort({ createdAt: -1 });

      
      // Format enquiries
      const formattedEnquiries = enquiries.map(enq => ({
        _id: enq._id,
        message: enq.message,
        status: enq.status || 'pending',
        readByBuyer: enq.readByBuyer || false,
        sellerResponse: enq.sellerResponse,
        createdAt: enq.createdAt,
        timeAgo: getTimeAgo(enq.createdAt),
        property: enq.property ? {
          _id: enq.property._id,
          title: enq.property.title,
          location: enq.property.location,
          price: enq.property.price,
          image: enq.property.images?.[0]
        } : null,
        seller: enq.seller ? {
          name: enq.seller.name,
          email: enq.seller.email,
          phone: enq.seller.phone
        } : null
      }));

      const unreadCount = chats.reduce((total, chat) => {
        return total + (chat.unreadCount?.[user._id] || 0);
      }, 0);

      return res.json({
        success: true,
        role: "buyer",
        data: {
          enquiries: formattedEnquiries,
          chats,
          savedProperties, 
          unreadCount,
          stats: {
            totalEnquiries: enquiries.length,
            pendingEnquiries: enquiries.filter(e => e.status === 'pending').length,
            unreadEnquiries: enquiries.filter(e => !e.readByBuyer).length,
            activeChats: chats.length,
            unreadMessages: unreadCount,
            savedCount: savedProperties.length
          }
        }
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: "Invalid role" 
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short' 
  });
}