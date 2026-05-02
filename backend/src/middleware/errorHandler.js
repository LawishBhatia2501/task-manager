class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

const errorHandler = (err, req, res, next) => {
  
  const logLevel = err.statusCode >= 500 ? 'error' : 'warn';
  console[logLevel](`[${new Date().toISOString()}] ${err.name}: ${err.message}`, {
    path: req.path,
    method: req.method,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  
  if (err.name === 'MongoServerError' || err.name === 'MongoError') {
    
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        error: {
          type: 'ConflictError',
          message: `A record with this ${field} already exists`,
          statusCode: 409,
          field
        }
      });
    }
    
    
    if (err.message.includes('connection') || err.message.includes('connect')) {
      return res.status(503).json({
        error: {
          type: 'DatabaseError',
          message: 'Database connection error',
          statusCode: 503
        }
      });
    }
  }

  
  if (err.name === 'ValidationError' && err.errors) {
    const validationErrors = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));
    
    return res.status(400).json({
      error: {
        type: 'ValidationError',
        message: 'Validation failed',
        statusCode: 400,
        details: validationErrors
      }
    });
  }

  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        type: 'ValidationError',
        message: `Invalid ${err.path}: ${err.value}`,
        statusCode: 400
      }
    });
  }

  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        type: 'AuthenticationError',
        message: 'Invalid token',
        statusCode: 401
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        type: 'AuthenticationError',
        message: 'Token expired',
        statusCode: 401
      }
    });
  }

  
  const statusCode = err.statusCode || 500;
  const errorType = err.name || 'ServerError';
  const message = err.message || 'Internal server error';

  
  const errorResponse = {
    error: {
      type: errorType,
      message: statusCode === 500 && process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : message,
      statusCode
    }
  };

  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  errorHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};