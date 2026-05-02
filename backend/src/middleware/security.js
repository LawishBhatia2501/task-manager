const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === 'production' ? 10 : 100, 
  message: {
    error: {
      type: 'RateLimitError',
      message: 'Too many authentication attempts, please try again later',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  message: {
    error: {
      type: 'RateLimitError',
      message: 'Too many requests, please try again later',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const getCorsOptions = () => {
  
  if (process.env.NODE_ENV !== 'production') {
    return {
      origin: true, 
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
  }

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600
  };
};

module.exports = {
  helmetConfig,
  authLimiter,
  apiLimiter,
  getCorsOptions
};