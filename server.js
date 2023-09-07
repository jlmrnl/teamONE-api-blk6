// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const loginRoutes = require("./router/login_routes");
const signupRoutes = require("./router/signup_routes");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use(bodyParser.json());
app.use("/api", loginRoutes);
app.use("/api", signupRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
