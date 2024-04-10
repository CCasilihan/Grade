// Import required modules
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./database.js');

const { verifyToken, secretKey } = require('./verifyToken');

// Create a new router
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if email already exists
      const user = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
      if (user.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Insert the user into the database
      const newUser = await pool.query(
        'INSERT INTO students (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, hashedPassword]
      );
  
      res.json(newUser.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user in the database
        const user = await pool.query('SELECT * FROM students WHERE email = $1', [email]);

        if (user.rows.length > 0) {
            // Compare the provided password with the hashed password in the database
            const validPassword = await bcrypt.compare(password, user.rows[0].password);

            if (!validPassword) {
                return res.status(400).json({ message: 'Incorrect password2' });
            }

            // Generate a JWT
            const token = jwt.sign(
                { 
                  id: user.rows[0].id, 
                  name: user.rows[0].name
                }, 
                secretKey
              );

            res.json({ token });
        } else {
            res.status(400).json({ message: 'User does not exist' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// View route (protected with verifyToken middleware)
router.get('/view', verifyToken, async (req, res) => {
    try {
        // The user's ID should be available in req.user.id if verifyToken is set up correctly
        const { id } = req.user;

        // Fetch the user's name and email from the database
        const user = await pool.query('SELECT name, email FROM students WHERE id = $1', [id]);

        if (user.rows.length > 0) {
            // Send the user's name and email in the response
            res.json(user.rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Update route (protected with verifyToken middleware)
router.put('/changePass', async (req, res) => {
    try {
        // The user's email should be available in req.body.email
        const { email, password } = req.body;

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user's password in the database
        const updatedUser = await pool.query(
            'UPDATE students SET password = $1 WHERE email = $2 RETURNING *',
            [hashedPassword, email]
        );

        if (updatedUser.rows.length > 0) {
            // Send the updated user's data in the response
            res.json(updatedUser.rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update route (protected with verifyToken middleware)
router.put('/update', verifyToken, async (req, res) => {
    try {
        // The user's ID should be available in req.user.id if verifyToken is set up correctly
        const { id } = req.user;

        // The new data should be in req.body
        const { name, password } = req.body;

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update the user's data in the database
        const updatedUser = await pool.query(
            'UPDATE students SET name = $1, password = $2 WHERE id = $3 RETURNING *',
            [name, hashedPassword, id]
        );

        if (updatedUser.rows.length > 0) {
            // Send the updated user's data in the response
            res.json(updatedUser.rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete route (protected with verifyToken middleware)
router.delete('/delete', verifyToken, async (req, res) => {
    try {
        // The user's ID should be available in req.user.id if verifyToken is set up correctly
        const { id } = req.user;

        // Delete the user from the database
        const deletedUser = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

        if (deletedUser.rows.length > 0) {
            // Send a success message in the response
            res.json({ message: 'User deleted successfully.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Export the router
module.exports = router;