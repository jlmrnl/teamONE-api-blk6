const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const path = require('path');
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 15;

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const sequelize = require('./config/db.config');

app.use('/user', userRoutes);
app.use("/posts", postRoutes);


app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
