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
// app.use(cors());

// app.use(cors({
//   origin: [process.env.FRONTEND_URL],
//   credentials: true
// }));
// ✅ Enable CORS for frontend domains
// ✅ Allow frontend + admin panel
app.use(
  cors({
    origin: [
      "http://localhost:8000",         // local dev
      "https://cabzii.in",             // user frontend
      "https://www.cabzii.in",         // www version
      "https://admin.cabzii.in",       // admin panel ✅
      "https://www.admin.cabzii.in",       // admin panel ✅
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Make 'uploads' folder public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use full path routes inside files
app.use("/api", userRoute);
// app.use(carRoute);
app.use("/api", carRoute); // Now all endpoints start with /api
app.use("/api", travelRoutes);

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
