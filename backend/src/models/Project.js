const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin is required']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  collection: 'projects'
});

projectSchema.index({ adminId: 1 });

projectSchema.index({ members: 1 });

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId'
});

projectSchema.methods.isAdmin = function(userId) {
  return this.adminId.toString() === userId.toString();
};

projectSchema.methods.isMember = function(userId) {
  return this.members.some(memberId => 
    memberId.toString() === userId.toString()
  );
};

projectSchema.methods.hasAccess = function(userId) {
  return this.isAdmin(userId) || this.isMember(userId);
};

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;