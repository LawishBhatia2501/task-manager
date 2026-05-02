const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const TaskService = require('../services/TaskService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().trim(),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Due date must be in ISO 8601 format'),
    body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
    body('projectId').isMongoId().withMessage('Invalid project ID')
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

      const task = await TaskService.createTask(req.body, req.user.id);

      res.status(201).json({ task });
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

router.get('/',
  [
    query('projectId').optional().isMongoId().withMessage('Invalid project ID')
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

      const { projectId } = req.query;

      let tasks;
      if (projectId) {
        tasks = await TaskService.getProjectTasks(projectId, req.user.id);
      } else {
        tasks = await TaskService.getUserTasks(req.user.id);
      }

      res.status(200).json({ tasks });
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

router.put('/:taskId/assign',
  [
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('assigneeId').isMongoId().withMessage('Invalid assignee ID')
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

      const { taskId } = req.params;
      const { assigneeId } = req.body;

      const task = await TaskService.assignTask(taskId, assigneeId, req.user.id);

      res.status(200).json({ task });
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

router.put('/:taskId/status',
  [
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('status').isIn(['To Do', 'In Progress', 'Done']).withMessage('Status must be To Do, In Progress, or Done')
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

      const { taskId } = req.params;
      const { status } = req.body;

      const task = await TaskService.updateTaskStatus(taskId, status, req.user.id);

      res.status(200).json({ task });
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

router.delete('/:taskId',
  [param('taskId').isMongoId().withMessage('Invalid task ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { type: 'ValidationError', message: 'Validation failed', statusCode: 400 } });
      }
      await TaskService.deleteTask(req.params.taskId, req.user.id);
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      if (error.name === 'AuthorizationError') return res.status(403).json({ error: { type: 'AuthorizationError', message: error.message, statusCode: 403 } });
      if (error.name === 'NotFoundError') return res.status(404).json({ error: { type: 'NotFoundError', message: error.message, statusCode: 404 } });
      res.status(500).json({ error: { type: 'ServerError', message: 'Internal server error', statusCode: 500 } });
    }
  }
);

module.exports = router;