const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  }
}, {
  timestamps: true,
  collection: 'users'
});

userSchema.virtual('adminProjects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'adminId'
});

userSchema.virtual('assignedTasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'assigneeId'
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;