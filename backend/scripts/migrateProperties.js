const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Property = require("../models/Property");

dotenv.config();
connectDB();

const updatePropertyOwners = async () => {
  try {
    console.log("Updating property owners...");
    
    const properties = await Property.find({});
    
    for (let property of properties) {
      let needsUpdate = false;
      
      if (property.seller && !property.owner) {
        property.owner = property.seller;
        needsUpdate = true;
      }
      
      if (property.builder && !property.owner) {
        property.owner = property.builder;
        needsUpdate = true;
      }
      
      if (property.status === "sold" && !property.purchasedBy && property.owner) {
        property.purchasedBy = property.owner;
        property.purchasedAt = property.updatedAt || new Date();
        needsUpdate = true;
      }
      
      if (property.owner && !property.createdBy) {
        property.createdBy = property.owner;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await property.save();
        console.log(`Updated property: ${property._id} - ${property.title}`);
      }
    }
    
    console.log("Update completed!");
    process.exit();
  } catch (error) {
    console.error("Error updating properties:", error);
    process.exit(1);
  }
};

updatePropertyOwners();