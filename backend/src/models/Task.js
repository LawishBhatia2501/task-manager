const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Priority must be Low, Medium, or High'
    },
    required: [true, 'Priority is required']
  },
  status: {
    type: String,
    enum: {
      values: ['To Do', 'In Progress', 'Done'],
      message: 'Status must be To Do, In Progress, or Done'
    },
    default: 'To Do'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'tasks'
});

taskSchema.index({ projectId: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

taskSchema.methods.isOverdue = function() {
  return this.dueDate < new Date() && this.status !== 'Done';
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;