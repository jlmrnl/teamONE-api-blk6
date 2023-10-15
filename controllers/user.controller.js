const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const User = require("../models/user.model");
const sequelize = require('../config/db.config');



    module.exports = {
        signup,
        signin,
    };
