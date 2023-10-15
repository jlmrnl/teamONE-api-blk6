const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Assuming your User model is in the models folder
const bcrypt = require("bcrypt");
const router = express.Router();

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
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET);
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

module.exports = router;
