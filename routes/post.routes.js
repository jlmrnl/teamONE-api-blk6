const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Post = require("../models/post.model");
const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads/");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if the directory exists, create it if it doesn't
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST a new post with image upload
router.post("/", upload.single("image_url"), async (req, res) => {
  try {
    const { user_id, category, description } = req.body;
    const image_url = req.file ? req.file.filename : null;

    const post = await Post.create({ user_id, category, description, image_url });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT update post by ID
router.put("/:id", upload.single("image_url"), async (req, res) => {
    const postId = req.params.id;
    try {
      const { user_id, category, description } = req.body;
      const image_url = req.file ? req.file.filename : null; // Get updated image URL from uploaded file
  
      // Find the post by ID
      const postToUpdate = await Post.findByPk(postId);
  
      // If the post doesn't exist, return an error response
      if (!postToUpdate) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      postToUpdate.image_url = image_url; // Update the image URL
  
      // Save the updated post to the database
      await postToUpdate.save();
  
      // Send the updated post as the response
      res.json(postToUpdate);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// DELETE post by ID
router.delete("/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    await Post.destroy({ where: { post_id: postId } });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
