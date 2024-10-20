const jwt = require('jsonwebtoken');

function generateToken(id) {
    return jwt.sign(
        {
            id: id,
        },
        process.env.JWT_KEY || "@njkddm#jkim",
        { expiresIn: 60 * 60 * 24 * 20 } // 20 days
    );
}

module.exports = generateToken;