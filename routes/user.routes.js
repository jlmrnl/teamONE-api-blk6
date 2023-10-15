const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Assuming your User model is in the models folder
const bcrypt = require("bcrypt");
const cors = require('cors');
const router = express.Router();
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, Date.now() + "-" + cleanFileName);
  },
});


const upload = multer({ storage: storage });


// Function to decode JWT token and extract user information
function decodeJwtToken(token) {
  try {
    const decoded = jwt.decode(token, { complete: true });
    const user = decoded.payload;
    return user;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("Token:", token);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  // Decoding JWT token and extracting user information
  const user = decodeJwtToken(token);

  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = user;
  next();
};

// GET all users route
router.get("/", async (req, res) => {
  try {
    // Retrieve all users from the database
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'birthdate', 'createdAt', 'updatedAt']
    });

    // Return the list of users
    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET user by ID route
router.get("/:id",  async (req, res) => {
  const userId = req.params.id;

  try {
    // Retrieve user by ID from the database
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'birthdate', 'createdAt', 'updatedAt'] // Define the attributes you want to retrieve
    });

    // Check if the user with the given ID exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user details
    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, birthdate } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({ name, email, password: hashedPassword, birthdate });

    // Do not send hashed password back to the client
    const user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user with the provided email exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  
    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    const userDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate,
      joined: user.createdAt
    };

    res.status(200).json({ token, user: userDetails });
  } catch (error) {
    console.error("Error signing in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// PUT update user profile by token
router.put("/:token", upload.single("image"), async (req, res) => {
  const userToken = req.params.token;

  // Verify the token
  jwt.verify(userToken, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      console.error("Error verifying token:", err);
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const userId = user.userId;
      const { name, birthdate, password } = req.body;
      const image = req.file; // Access the uploaded image file

      // Find the user by ID
      const userToUpdate = await User.findByPk(userId);

      if (!userToUpdate) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user fields
      userToUpdate.name = name || userToUpdate.name;
      userToUpdate.birthdate = birthdate || userToUpdate.birthdate;
      userToUpdate.image_url = image ? image.filename : userToUpdate.image_url;

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        userToUpdate.password = hashedPassword;
      }

      await userToUpdate.save();

      const token = jwt.sign({ userId: userToUpdate.id, email: userToUpdate.email }, process.env.JWT_SECRET);
      const userDetails = {
        birthdate: userToUpdate.birthdate,
        image_url: userToUpdate.image_url,
        joined: userToUpdate.createdAt,
      };

      res.status(200).json({ token, user: userDetails });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});


module.exports = router;
