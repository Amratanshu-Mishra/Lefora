const express = require("express");
const multer = require("multer");
const router = express.Router();
const Post = require("../models/postModel");
const mongoose = require("mongoose");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory to store uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename
  },
});

// Use `array` to allow multiple file uploads
const upload = multer({ storage: storage }).array("images"); // Allow multiple image uploads

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find(); // Fetch all posts from the database
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// GET posts by user ID
router.get("/author/:author", async (req, res) => {
  const { author } = req.params;
  console.log("Fetching posts for author:", author); // Log the author being fetched

  try {
    const posts = await Post.find({ author });
    console.log("Posts found:", posts); // Log the retrieved posts

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for this author" });
    }
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts for author:", error);
    res.status(500).json({ message: "Failed to fetch posts for author" });
  }
});

// CREATE a post with images
router.post("/", upload, async (req, res) => {
  const { title, content, author } = req.body;
  const images = req.files ? req.files.map((file) => file.path) : []; // Get paths of uploaded images

  if (!title || !content || !author) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newPost = new Post({ title, content, author, images });
    await newPost.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET a single post by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
});

// ADD a comment to a post
router.post("/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.comments.push({ author, text });
    await post.save();
    res.status(201).json({ message: "Comment added successfully", post });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// TOGGLE like/unlike a post
router.post("/:id/toggle-like", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likedBy.includes(userId);
    if (hasLiked) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likes -= 1;
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();
    res
      .status(200)
      .json({ message: hasLiked ? "Post unliked" : "Post liked", post });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

// UPDATE a post (with optional image updates)
router.put("/:id", upload, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const images = req.files ? req.files.map((file) => file.path) : post.images;

    post.title = title;
    post.content = content;
    post.images = images;

    await post.save();
    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
});

// DELETE a post
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }

  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

module.exports = router;
