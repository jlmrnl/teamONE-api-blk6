const express = require('express');
const bodyParser = require('body-parser'); // Add this line
const mysql = require('mysql');
const cors = require('cors');
const os = require('os');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware for form data

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

app.use('/auth', authRoutes(db)); // Pass the db connection object to route handlers

const getLocalIpAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const interface of interfaces) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '127.0.0.1'; // Default to localhost if no valid IP address is found.
};

const localIpAddress = getLocalIpAddress();
console.log(localIpAddress)

app.listen(port, '0.0.0.0',  localIpAddress, () => {
  console.log(`Server is running on port ${port}`);
});
