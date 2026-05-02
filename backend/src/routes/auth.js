const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthenticationService = require('../services/AuthenticationService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  async (req, res) => {
    try {
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            type: 'ValidationError',
            message: 'Validation failed',
            errors: errors.array().map(err => ({
              field: err.path,
              message: err.msg
            })),
            statusCode: 400
          }
        });
      }

      const { name, email, password } = req.body;
      const result = await AuthenticationService.register(name, email, password);

      res.status(201).json(result);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: {
            type: 'ValidationError',
            message: error.message,
            statusCode: 400
          }
        });
      }

      if (error.name === 'ConflictError') {
        return res.status(409).json({
          error: {
            type: 'ConflictError',
            message: error.message,
            statusCode: 409
          }
        });
      }

      res.status(500).json({
        error: {
          type: 'ServerError',
          message: 'Internal server error',
          statusCode: 500
        }
      });
    }
  }
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            type: 'ValidationError',
            message: 'Validation failed',
            errors: errors.array().map(err => ({
              field: err.path,
              message: err.msg
            })),
            statusCode: 400
          }
        });
      }

      const { email, password } = req.body;
      const result = await AuthenticationService.login(email, password);

      res.status(200).json(result);
    } catch (error) {
      if (error.name === 'AuthenticationError') {
        return res.status(401).json({
          error: {
            type: 'AuthenticationError',
            message: error.message,
            statusCode: 401
          }
        });
      }

      res.status(500).json({
        error: {
          type: 'ServerError',
          message: 'Internal server error',
          statusCode: 500
        }
      });
    }
  }
);

router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      error: {
        type: 'ServerError',
        message: 'Internal server error',
        statusCode: 500
      }
    });
  }
});

module.exports = router;