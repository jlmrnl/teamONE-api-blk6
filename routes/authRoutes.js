const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const router = express.Router();

function authRoutes(db) {
  router.use(
    session({
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    })
  );

  router.get('/', (req, res) => {
    res.send('Welcome to the authentication API!');
  });

  router.get('/users', (req, res) => {
    const sql = 'SELECT * FROM tbl_user';

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching users: ' + err.message);
        return res.status(500).json({ message: 'Error fetching users' });
      }

      res.status(200).json(results);
    });
  });

  router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    const hashedPassword = bcrypt.hashSync(password, 10);

    // SQL statement to create the table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS tbl_user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;
  
    // SQL statement to check if the email already exists
    const checkEmailSQL = 'SELECT * FROM tbl_user WHERE email = ?';
  
    // SQL statement to insert user data
    const insertUserSQL = 'INSERT INTO tbl_user (name, email, password) VALUES (?, ?, ?)';
  
    // Check if the email already exists
    db.query(checkEmailSQL, [email], (err, result) => {
      if (err) {
        console.error('Error checking email: ' + err.message);
        return res.status(500).json({ message: 'Error checking email' });
      }
  
      // If email exists, return an error response
      if (result.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      // Email doesn't exist, insert user data into the table
      db.query(insertUserSQL, [name, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error storing user: ' + err.message);
          return res.status(500).json({ message: 'Error signing up' });
        }
        res.status(201).json({ message: 'User registered successfully' });
        console.log('A user registered successfully');
      });
    });
  });
  
  

  router.post('/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const sql = 'SELECT * FROM tbl_user WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) {
        console.error('Error retrieving user: ' + err.message);
        return res.status(500).json({ message: 'Error signing in' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = results[0];

      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      req.session.userId = user.id;

      const token = jwt.sign({ id: user.id, email: user.email }, 'your_secret_key', {
        expiresIn: '12h'
      });

      res.status(200).json({
        message: 'Login successful',
        name: user.name,
        token
      });
      console.log('A user logged in');
    });
  });

  return router;
}

module.exports = authRoutes;
