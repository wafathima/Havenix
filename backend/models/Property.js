const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    images: [{
      type: String  
    }],
    roomImages: {
      exterior: [{ type: String }],
      bedroom: [{ type: String }],
      bathroom: [{ type: String }],
      livingRoom: [{ type: String }],
      diningRoom: [{ type: String }],
      kitchen: [{ type: String }]
    },
    
    location: {
      type: String,
      required: true
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    type: {
      type: String,
      enum: ["Villa", "Apartment", "Farmhouse", "Home", "Condo", "Penthouse", "Office", "Land"],
      required: true
    },
    status: {
      type: String,
      enum: ["available", "sold", "under_contract", "under_construction"],
      default: "available"
    },
    bedrooms: {
      type: Number,
      default: 2,
      min: 0,
      max: 20
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: 0,
      max: 15
    },
    area: {
      type: Number, 
      required: true,
      min: 100
    },
    floor: {
      type: Number,
      default: 1,
      min: 0
    },
    totalFloors: {
      type: Number,
      default: 1,
      min: 1
    },
    furnished: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
      default: "Semi-Furnished"
    },
    yearBuilt: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear()
    },
    parking: {
      type: Number,
      default: 0,
      description: "Number of parking spaces"
    },
    features: [{
      type: String
    }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    videoUrl: {
      type: String
    },
    virtualTourUrl: {
      type: String
    },
    views: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },
  
     averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);

propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model("Property", propertySchema);