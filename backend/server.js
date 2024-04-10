const express = require('express');
const pool = require('./database.js');
const studentsRouter = require('./students');
const gradesRouter = require('./course&grades');
const cors = require('cors');
const otpSender = require('./otpsender');
const path = require('path'); // Add this line

const app = express();
app.use(cors());
app.use(express.json());

//routes
app.use('/students', studentsRouter);
app.use('/course-grades', gradesRouter);
app.use('/otpSender', otpSender);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build'))); 

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html')); 
});

// Start the server
const port = process.env.PORT || 4000; // Use the PORT environment variable if it's available
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// Don't forget to close the pool when you're done
process.on('exit', () => {
    pool.end();
});