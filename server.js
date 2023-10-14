const express = require('express');
const bodyParser = require('body-parser'); // Add this line
const mysql = require('mysql');
const cors = require('cors');
const os = require('os');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));



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

app.use('/auth', authRoutes(db));
app.use('/post', postRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
