const Task = require('../models/Task');
const ProjectService = require('./ProjectService');
const { validateNonEmptyString, validateDate, validatePriority, validateStatus } = require('../utils/validation');

class TaskService {
  async createTask(taskData, requestingUserId) {
    const { title, description, dueDate, priority, projectId } = taskData;

    if (!validateNonEmptyString(title)) {
      const error = new Error('Task title is required and cannot be empty');
      error.name = 'ValidationError';
      throw error;
    }

    if (!validatePriority(priority)) {
      const error = new Error('Priority must be Low, Medium, or High');
      error.name = 'ValidationError';
      throw error;
    }

    const isAdmin = await ProjectService.isAdmin(projectId, requestingUserId);
    if (!isAdmin) {
      const error = new Error('Only project admin can create tasks');
      error.name = 'AuthorizationError';
      throw error;
    }

    const task = await Task.create({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      projectId,
      status: 'To Do'
    });

    return {
      id: task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      createdAt: task.createdAt
    };
  }

  async assignTask(taskId, assigneeUserId, requestingUserId) {
    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error('Task not found');
      error.name = 'NotFoundError';
      throw error;
    }

    const isAdmin = await ProjectService.isAdmin(task.projectId, requestingUserId);
    if (!isAdmin) {
      const error = new Error('Only project admin can assign tasks');
      error.name = 'AuthorizationError';
      throw error;
    }

    const hasAccess = await ProjectService.hasAccess(task.projectId, assigneeUserId);
    if (!hasAccess) {
      const error = new Error('Assignee must be a member or admin of the project');
      error.name = 'ValidationError';
      throw error;
    }

    task.assigneeId = assigneeUserId;
    await task.save();

    return {
      id: task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assigneeId
    };
  }

  async updateTaskStatus(taskId, status, requestingUserId) {
    if (!validateStatus(status)) {
      const error = new Error('Status must be To Do, In Progress, or Done');
      error.name = 'ValidationError';
      throw error;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error('Task not found');
      error.name = 'NotFoundError';
      throw error;
    }

    const isAdmin = await ProjectService.isAdmin(task.projectId, requestingUserId);
    const isAssignee = task.assigneeId && task.assigneeId.toString() === requestingUserId.toString();

    if (!isAdmin && !isAssignee) {
      const error = new Error('Only project admin or task assignee can update task status');
      error.name = 'AuthorizationError';
      throw error;
    }

    task.status = status;
    await task.save();

    return {
      id: task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assigneeId
    };
  }

  async deleteTask(taskId, requestingUserId) {
    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error('Task not found');
      error.name = 'NotFoundError';
      throw error;
    }
    const isAdmin = await ProjectService.isAdmin(task.projectId, requestingUserId);
    if (!isAdmin) {
      const error = new Error('Only project admin can delete tasks');
      error.name = 'AuthorizationError';
      throw error;
    }
    await Task.findByIdAndDelete(taskId);
  }

  async getUserTasks(userId) {
    const adminProjects = await ProjectService.getAdminProjectIds(userId);

    const tasks = await Task.find({
      $or: [
        { assigneeId: userId },
        { projectId: { $in: adminProjects } }
      ]
    })
      .populate('projectId', 'name')
      .populate('assigneeId', 'name email');

    const seen = new Set();
    return tasks
      .filter(task => {
        const id = task._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map(task => ({
        _id: task._id,
        id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        projectId: task.projectId._id,
        project: { _id: task.projectId._id, name: task.projectId.name },
        assignee: task.assigneeId ? {
          _id: task.assigneeId._id,
          name: task.assigneeId.name,
          email: task.assigneeId.email
        } : null
      }));
  }

  async getProjectTasks(projectId, requestingUserId) {
    const hasAccess = await ProjectService.hasAccess(projectId, requestingUserId);
    if (!hasAccess) {
      const error = new Error('You do not have access to this project');
      error.name = 'AuthorizationError';
      throw error;
    }

    const tasks = await Task.find({ projectId })
      .populate('assigneeId', 'name email');

    return tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      assignee: task.assigneeId ? {
        id: task.assigneeId._id,
        name: task.assigneeId.name,
        email: task.assigneeId.email
      } : null
    }));
  }
}

module.exports = new TaskService();