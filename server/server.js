require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").Server(app);
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const postRoute = require("./routes/postRoute");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const orderRoutes = require("./routes/orderRoutes");
const emailRoutes = require("./routes/emailRoutes");
const searchRoutes = require("./routes/search");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware to parse JSON and handle CORS
app.use(cors()); // Consider limiting to specific origins in production
app.use(express.json());

// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoute);
app.use("/api/orders", orderRoutes);
app.use("/api", emailRoutes);
app.use("/api", searchRoutes);

// Connect to MongoDB with error handling
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not set in the environment variables.");
  process.exit(1); // Exit the application if MONGO_URI is not set
}

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// Handle MongoDB connection events for disconnection, reconnection, etc.
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});
mongoose.connection.on("reconnected", () => {
  console.info("MongoDB reconnected.");
});

// Add a new route for handling multiple file uploads (if needed separately)
app.post("/upload-multiple", async (req, res) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, "uploads/"),
      filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname),
    }),
  }).array("images", 5);

  upload(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res
        .status(500)
        .json({ message: "Failed to upload files", error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files were uploaded." });
    }

    const filePaths = req.files.map((file) => file.path);
    res
      .status(200)
      .json({ message: "Files uploaded successfully", files: filePaths });
  });
});

// Define a sample route to test the server
app.get("/", (req, res) => {
  res.send("Server is running and connected to MongoDB");
});

// Start the server
http.listen(3001, function () {
  console.log("Server is running on port 3001...");
});
