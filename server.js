const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + db.threadId);
});

app.use(bodyParser.json());

app.use('/', authRoutes(db)); // Pass the db connection object to route handlers

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
