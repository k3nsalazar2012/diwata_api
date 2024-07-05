require('dotenv').config();
const jwt = require('jsonwebtoken');

const SERVER_KEY = process.env.SERVER_KEY;

function generateToken() {
    return jwt.sign({}, SERVER_KEY, { expiresIn: '1h' });
}

function verifyToken(token) {
    try {
        jwt.verify(token, SERVER_KEY);
        return true;
    } catch (error) {
        return false;
    }
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.sendStatus(401);
    }

    if (verifyToken(token)) {
        next();
    } else {
        return res.sendStatus(403);
    }
}

module.exports = { generateToken, verifyToken, authenticateToken };