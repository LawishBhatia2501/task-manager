const AuthenticationService = require('../services/AuthenticationService');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: {
          type: 'AuthenticationError',
          message: 'Authentication token required',
          statusCode: 401
        }
      });
    }

    const user = await AuthenticationService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        type: 'AuthenticationError',
        message: error.message || 'Invalid or expired token',
        statusCode: 401
      }
    });
  }
};

module.exports = {
  authenticateToken
};