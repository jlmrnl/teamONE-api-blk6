const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

function authRoutes(db) {
     router.get('/', (req, res) => {
        res.send('Welcome to the authentication API!');
      });

      router.get('/users', (req, res) => {
        const sql = 'SELECT * FROM tbl_user'; // Assuming your table name is 'users'
    
        // Execute the query
        db.query(sql, (err, results) => {
            if (err) {
                // Handle database error
                console.error('Error fetching users: ' + err.message);
                return res.status(500).json({ message: 'Error fetching users' });
            }
    
            // Send the users data as a JSON response
            res.status(200).json(results);
        });
    });
      
      
      router.post('/signup', (req, res) => {
        const { name, email, password } = req.body;
      
        // Validate input
        if (!name || !email || !password) {
          return res.status(400).json({ message: 'All fields are required' });
        }
      
        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);
      
        // Store user in the database
        const sql = 'INSERT INTO tbl_user (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, hashedPassword], (err, result) => {
          if (err) {
            console.error('Error storing user: ' + err.message);
            return res.status(500).json({ message: 'Error signing up' });
          }
          res.status(201).json({ message: 'User registered successfully' });
        });
      });
      
      router.post('/signin', (req, res) => {
        const { email, password } = req.body;
      
        // Validate input
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }
      
        // Retrieve user from the database
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
      
          // Compare hashed password
          if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid email or password' });
          }
      
          // Generate JWT token
          const token = jwt.sign({ id: user.id, email: user.email }, 'your_secret_key', {
            expiresIn: '1h'
          });
      
          res.status(200).json({ message: 'Login successful', token });
        });
      });

  return router;
}

module.exports = authRoutes;
