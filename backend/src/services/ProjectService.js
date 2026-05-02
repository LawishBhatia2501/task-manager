const Project = require('../models/Project');
const User = require('../models/User');
const { validateNonEmptyString } = require('../utils/validation');

class ProjectService {
  async createProject(name, adminUserId) {
    if (!validateNonEmptyString(name)) {
      const error = new Error('Project name is required and cannot be empty');
      error.name = 'ValidationError';
      throw error;
    }

    const project = await Project.create({
      name,
      adminId: adminUserId,
      members: []
    });

    return {
      id: project._id,
      name: project.name,
      adminId: project.adminId,
      members: project.members,
      createdAt: project.createdAt
    };
  }

  async addMemberByEmail(projectId, userEmail, requestingUserId) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (!project.isAdmin(requestingUserId)) {
      const error = new Error('Only project admin can add members');
      error.name = 'AuthorizationError';
      throw error;
    }

    const user = await User.findOne({ email: userEmail.toLowerCase() });
    if (!user) {
      const error = new Error('No account found with that email address');
      error.name = 'NotFoundError';
      throw error;
    }

    if (user._id.toString() === requestingUserId.toString()) {
      const error = new Error('You are already the admin of this project');
      error.name = 'ValidationError';
      throw error;
    }

    if (project.isMember(user._id)) {
      const error = new Error('User is already a member of this project');
      error.name = 'ValidationError';
      throw error;
    }

    project.members.push(user._id);
    await project.save();

    return {
      projectId: project._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: 'Member'
    };
  }

  async addMember(projectId, userId, requestingUserId) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (!project.isAdmin(requestingUserId)) {
      const error = new Error('Only project admin can add members');
      error.name = 'AuthorizationError';
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (project.isMember(userId)) {
      const error = new Error('User is already a member of this project');
      error.name = 'ValidationError';
      throw error;
    }

    project.members.push(userId);
    await project.save();

    return {
      projectId: project._id,
      userId: userId,
      role: 'Member'
    };
  }

  async removeMember(projectId, userId, requestingUserId) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';
      throw error;
    }

    if (!project.isAdmin(requestingUserId)) {
      const error = new Error('Only project admin can remove members');
      error.name = 'AuthorizationError';
      throw error;
    }

    project.members = project.members.filter(
      memberId => memberId.toString() !== userId.toString()
    );
    await project.save();
  }

  async getUserProjects(userId) {
    const adminProjects = await Project.find({ adminId: userId })
      .populate('adminId', 'name email')
      .populate('members', 'name email');

    const memberProjects = await Project.find({ members: userId })
      .populate('adminId', 'name email')
      .populate('members', 'name email');

    const formattedAdminProjects = adminProjects.map(project => {
      const adminUser = project.adminId;
      const adminMember = { _id: adminUser._id, id: adminUser._id, name: adminUser.name, email: adminUser.email };
      const otherMembers = project.members.map(m => ({ _id: m._id, id: m._id, name: m.name, email: m.email }));
      return {
        _id: project._id,
        id: project._id,
        name: project.name,
        role: 'Admin',
        adminId: adminUser._id,
        adminName: adminUser.name,
        members: [adminMember, ...otherMembers],
        createdAt: project.createdAt
      };
    });

    const formattedMemberProjects = memberProjects.map(project => {
      const adminUser = project.adminId;
      const adminMember = { _id: adminUser._id, id: adminUser._id, name: adminUser.name, email: adminUser.email };
      const otherMembers = project.members.map(m => ({ _id: m._id, id: m._id, name: m.name, email: m.email }));
      return {
        _id: project._id,
        id: project._id,
        name: project.name,
        role: 'Member',
        adminId: adminUser._id,
        adminName: adminUser.name,
        members: [adminMember, ...otherMembers],
        createdAt: project.createdAt
      };
    });

    return [...formattedAdminProjects, ...formattedMemberProjects];
  }

  async getAdminProjectIds(userId) {
    const projects = await Project.find({ adminId: userId }, '_id');
    return projects.map(p => p._id);
  }

  async isAdmin(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) return false;
    return project.isAdmin(userId);
  }

  async hasAccess(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) return false;
    return project.hasAccess(userId);
  }
}

module.exports = new ProjectService();