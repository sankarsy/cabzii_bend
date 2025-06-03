const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require("path");
const userRoute = require('./router/userRoute');
const carRoute = require('./router/carRoute');
const travelRoutes = require('./router/travelPackageRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Make 'uploads' folder public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use full path routes inside files
app.use(userRoute);
app.use(carRoute);
app.use(travelRoutes);

// MongoDB connection
const URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8000;

mongoose.connect(URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('MongoDB is connected successfully');
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
