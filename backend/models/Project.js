const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  tagline: String,
  description: { type: String, required: true },
  price: { type: Number, required: true },
  pricePerSqFt: Number,
  location: { type: String, required: true },
  city: String,
  state: String,
  pincode: String,
  landmark: String,
  
  // Project Details
  projectType: { type: String, default: 'Apartment' },
  status: { type: String, default: 'ongoing' },
  totalUnits: Number,
  availableUnits: Number,
  totalTowers: Number,
  floorsPerTower: Number,
  possessionDate: Date,
  possessionStatus: String,
  reraNumber: String,
  reraApproved: { type: Boolean, default: false },
  
  // Unit Details
  bedrooms: { type: Number, default: 2 },
  bathrooms: { type: Number, default: 2 },
  balconies: { type: Number, default: 1 },
  area: { type: Number, required: true },
  carpetArea: Number,
  superArea: Number,
  
  // Dimensions
  length: Number,
  breadth: Number,
  ceilingHeight: Number,
  facing: { type: String, default: 'East' },
  
  // Pricing
  basePrice: Number,
  floorRise: Number,
  parkingPrice: Number,
  maintenance: Number,
  maintenanceFrequency: { type: String, default: 'monthly' },
  stampDuty: Number,
  registration: Number,
  gst: Number,
  
  // Dates
  launchDate: Date,
  completionDate: Date,
  handoverDate: Date,
  
  // Legal
  landArea: Number,
  landOwnership: { type: String, default: 'freehold' },
  approvalAuthority: String,
  approvalNumber: String,
  approvalDate: Date,
  
  // Developer
  developerName: String,
  developerExperience: Number,
  completedProjects: Number,
  awards: String,
  
  // Construction
  constructionQuality: String,
  constructionType: { type: String, default: 'RCC' },
  projectArchitect: String,
  
  // Arrays
  features: [String],
  amenities: [String],
  nearbyPlaces: [{
    name: String,
    type: String,
    distance: String
  }],
  
  // Media
  images: [String],
  floorPlans: [String],
  videoUrl: String,
  brochureUrl: String,
  virtualTourUrl: String,
  
  // References
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);