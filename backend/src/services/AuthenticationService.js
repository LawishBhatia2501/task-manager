const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateEmail, validatePassword, validateNonEmptyString } = require('../utils/validation');

class AuthenticationService {
  async register(name, email, password) {
    if (!validateNonEmptyString(name)) {
      const error = new Error('Name is required and cannot be empty');
      error.name = 'ValidationError';
      throw error;
    }

    if (!validateEmail(email)) {
      const error = new Error('Invalid email format');
      error.name = 'ValidationError';
      throw error;
    }

    if (!validatePassword(password)) {
      const error = new Error('Password must be at least 8 characters long');
      error.name = 'ValidationError';
      throw error;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.name = 'ConflictError';
      throw error;
    }

    const passwordHash = await this.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash
    });

    const token = this.generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  async login(email, password) {
    if (!validateEmail(email)) {
      const error = new Error('Invalid credentials');
      error.name = 'AuthenticationError';
      throw error;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.name = 'AuthenticationError';
      throw error;
    }

    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.name = 'AuthenticationError';
      throw error;
    }

    const token = this.generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        const error = new Error('Invalid token');
        error.name = 'AuthenticationError';
        throw error;
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email
      };
    } catch (err) {
      const error = new Error('Invalid or expired token');
      error.name = 'AuthenticationError';
      throw error;
    }
  }

  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AuthenticationService();