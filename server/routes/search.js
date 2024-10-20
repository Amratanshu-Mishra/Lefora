// routes/search.js
const express = require("express");
const router = express.Router();
const Post = require("../models/postModel"); // Adjust the path as necessary

// Search route
router.get("/search", async (req, res) => {
  const query = req.query.q.toLowerCase();

  try {
    // Search for posts that match the query
    const results = await Post.find({
      title: { $regex: query, $options: "i" }, // Case-insensitive regex search
    });

    // Respond with the found results
    res.json(results);
  } catch (err) {
    console.error("Error fetching search results:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
