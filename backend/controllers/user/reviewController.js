const Review = require("../../models/Review");
const Property = require("../../models/Property");
const Enquiry = require("../../models/Enquiry");
const mongoose = require("mongoose"); 


const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log("Fetching reviews for property:", propertyId);

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID format"
      });
    }

    const reviews = await Review.find({ 
      property: propertyId,
      status: "approved" 
    })
      .populate("user", "name email avatar")
      .populate("response.respondedBy", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ 
      property: propertyId,
      status: "approved" 
    });

    const distribution = await Review.aggregate([
      { 
        $match: { 
          property: new mongoose.Types.ObjectId(propertyId), 
          status: "approved" 
        } 
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    distribution.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });

    // Calculate percentages
    const percentages = {};
    for (let i = 5; i >= 1; i--) {
      percentages[i] = total > 0 ? (ratingDistribution[i] / total) * 100 : 0;
    }

    console.log(`Found ${reviews.length} reviews for property ${propertyId}`);

    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      ratingDistribution: {
        counts: ratingDistribution,
        percentages
      }
    });

  } catch (error) {
    console.error("Error in getPropertyReviews:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};


const createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    if (req.user.role !== 'buyer' && req.user.role !== 'builder') {
      return res.status(403).json({
        success: false,
        message: "Only buyers and builders can write reviews"
      });
    }


    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (property.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot review your own property"
      });
    }

    const existingReview = await Review.findOne({
      property: propertyId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this property"
      });
    }

    
    const hasEnquired = await Enquiry.findOne({
      property: propertyId,
      buyer: req.user._id, 
      status: "accepted"
    });

    // Create review
    const review = await Review.create({
      property: propertyId,
      user: req.user._id,
      rating,
      comment,
      isVerifiedPurchase: !!hasEnquired 
    });

    console.log("Review created:", review._id);

    await review.populate("user", "name email avatar");

    await Review.calculateAverageRating(propertyId);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review
    });

  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review"
      });
    }

    const propertyId = review.property;
    await review.remove();

    await Review.calculateAverageRating(propertyId);

    res.json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    const userId = req.user._id;
    const hasMarked = review.helpful.includes(userId);

    if (hasMarked) {
      review.helpful = review.helpful.filter(id => id.toString() !== userId.toString());
    } else {
      // Add to helpful
      review.helpful.push(userId);
    }

    await review.save();

    res.json({
      success: true,
      message: hasMarked ? "Removed helpful mark" : "Marked as helpful",
      helpfulCount: review.helpful.length
    });

  } catch (error) {
    console.error("Error marking helpful:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review"
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    await Review.calculateAverageRating(review.property);

    res.json({
      success: true,
      message: "Review updated successfully",
      review
    });

  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("property", "title images location price")
      .sort("-createdAt");

    res.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getUserReviews
};