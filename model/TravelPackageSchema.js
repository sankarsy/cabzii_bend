const mongoose = require('mongoose');

const travelPackageSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
   
  },
  category: { 
    type: String, 
    required: true 
  },
  seoTitle: {            // Added SEO title field
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('TravelPackage', travelPackageSchema);
