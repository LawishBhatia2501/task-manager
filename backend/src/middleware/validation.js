const { validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

const validateRequest = (validations) => {
  return async (req, res, next) => {
    
    await Promise.all(validations.map(validation => validation.run(req)));

    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorDetails = errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }));

      return res.status(400).json({
        error: {
          type: 'ValidationError',
          message: 'Validation failed',
          statusCode: 400,
          details: errorDetails
        }
      });
    }

    next();
  };
};

const isValidObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

const isFutureDate = (value) => {
  const date = new Date(value);
  return date > new Date();
};

const isInEnum = (allowedValues) => {
  return (value) => allowedValues.includes(value);
};

module.exports = {
  validateRequest,
  isValidObjectId,
  isFutureDate,
  isInEnum
};