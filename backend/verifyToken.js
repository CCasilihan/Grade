const jwt = require('jsonwebtoken');

// Define a secret key for signing and verifying tokens
const secretKey = 'casi-secret-key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = { verifyToken, secretKey };