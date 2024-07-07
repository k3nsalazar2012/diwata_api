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
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log('empty header');
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];

    if (verifyToken(token)) {
        next();
    } else {
        console.log(`error processing token: ${token}`);
        return res.sendStatus(403);
    }
}

module.exports = { generateToken, verifyToken, authenticateToken };