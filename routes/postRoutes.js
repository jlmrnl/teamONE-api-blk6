const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
require('dotenv').config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Upload files to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with timestamp + original extension
  }
});

const upload = multer({ storage: storage });


const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

async function executeQuery(sql, params = []) {
  const connection = await mysql.createConnection(dbConfig);
  const [rows, fields] = await connection.execute(sql, params);
  connection.end();
  return rows;
}

// GET all posts
router.get('/', async (req, res) => {
  try {
    const sql = 'SELECT * FROM tbl_posts';
    const posts = await executeQuery(sql);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts: ' + error.message);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// GET a specific post by ID
router.get('/:postID', async (req, res) => {
  const postID = req.params.postID;
  try {
    const sql = 'SELECT * FROM tbl_posts WHERE PostID = ?';
    const posts = await executeQuery(sql, [postID]);
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(posts[0]);
  } catch (error) {
    console.error('Error fetching post: ' + error.message);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// POST a new post with image upload
router.post('/add', upload.single('image'), async (req, res) => {
  const { LostItemCategory, Description, UserID } = req.body;
  const ImageUrl = req.file ? req.file.filename : null;

  if (!ImageUrl) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  const createTableSQL = `
  CREATE TABLE IF NOT EXISTS tbl_posts (
    PostID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    Description VARCHAR(255),
    LostItemCategory VARCHAR(255),
    ImageUrl VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES tbl_user(id)
);

    `;

  try {
    const sql = 'INSERT INTO tbl_posts (ImageUrl, LostItemCategory, Description, UserID, CreatedAt) VALUES (?, ?, ?, ?, NOW())';
    await executeQuery(sql, [ImageUrl, LostItemCategory, Description, UserID]);
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post: ' + error.message);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// PUT (update) a specific post by ID
router.put('/:postID', upload.single('image'), async (req, res) => {
  const postID = req.params.postID;
  const { LostItemCategory, Description, UserID } = req.body;
  const ImageUrl = req.file ? req.file.filename : null; // Store the uploaded file's filename as ImageUrl

  try {
    const sql = 'UPDATE tbl_posts SET ImageUrl=?, LostItemCategory=?, Description=?, UserID=?, CreateAt=NOW() WHERE PostID=?';
    await executeQuery(sql, [ImageUrl, LostItemCategory, Description, UserID, postID]);
    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post: ' + error.message);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// DELETE a specific post by ID
router.delete('/:postID', async (req, res) => {
  const postID = req.params.postID;
  try {
    const sql = 'DELETE FROM tbl_posts WHERE PostID=?';
    await executeQuery(sql, [postID]);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post: ' + error.message);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;
