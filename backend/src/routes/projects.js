const express = require('express');
const { body, param, validationResult } = require('express-validator');
const ProjectService = require('../services/ProjectService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required')
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

      const { name } = req.body;
      const project = await ProjectService.createProject(name, req.user.id);

      res.status(201).json({ project });
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

router.get('/', async (req, res) => {
  try {
    const projects = await ProjectService.getUserProjects(req.user.id);
    res.status(200).json({ projects });
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

router.post('/:projectId/members',
  [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    body('userEmail').trim().isEmail().withMessage('Valid email is required')
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

      const { projectId } = req.params;
      const { userEmail } = req.body;

      const membership = await ProjectService.addMemberByEmail(
        projectId,
        userEmail,
        req.user.id
      );

      res.status(201).json({ membership });
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

      if (error.name === 'AuthorizationError') {
        return res.status(403).json({
          error: {
            type: 'AuthorizationError',
            message: error.message,
            statusCode: 403
          }
        });
      }

      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          error: {
            type: 'NotFoundError',
            message: error.message,
            statusCode: 404
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

router.delete('/:projectId/members/:userId',
  [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('userId').isMongoId().withMessage('Invalid user ID')
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

      const { projectId, userId } = req.params;

      await ProjectService.removeMember(projectId, userId, req.user.id);

      res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
      if (error.name === 'AuthorizationError') {
        return res.status(403).json({
          error: {
            type: 'AuthorizationError',
            message: error.message,
            statusCode: 403
          }
        });
      }

      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          error: {
            type: 'NotFoundError',
            message: error.message,
            statusCode: 404
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

module.exports = router;