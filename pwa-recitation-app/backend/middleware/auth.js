const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token'); // A common practice, but can be 'Authorization' header as well

  // Check if not token - for development/bypass mode, use default user
  if (!token) {
    // Use a default user for development when authentication is bypassed
    req.user = { 
      id: '000000000000000000000001', // Default ObjectId format
      name: 'Default User'
    };
    return next();
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    // If token is invalid, also use default user for development
    req.user = { 
      id: '000000000000000000000001', // Default ObjectId format
      name: 'Default User'
    };
    next();
  }
};
