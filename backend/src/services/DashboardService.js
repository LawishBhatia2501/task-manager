const Task = require('../models/Task');
const Project = require('../models/Project');

class DashboardService {
  async getDashboardMetrics(userId) {
    const adminProjects = await Project.find({ adminId: userId });
    const adminProjectIds = adminProjects.map(p => p._id);

    const memberProjects = await Project.find({ members: userId });
    const memberProjectIds = memberProjects.map(p => p._id);

    let tasks;
    if (adminProjectIds.length > 0) {
      tasks = await Task.find({ projectId: { $in: adminProjectIds } })
        .populate('assigneeId', 'name email');
    } else if (memberProjectIds.length > 0) {
      tasks = await Task.find({ 
        assigneeId: userId,
        projectId: { $in: memberProjectIds }
      })
        .populate('assigneeId', 'name email');
    } else {
      tasks = [];
    }

    const totalTasks = tasks.length;
    const tasksByStatus = this.groupByStatus(tasks);
    const tasksByAssignee = this.groupByAssignee(tasks);
    const overdueTasks = this.calculateOverdueTasks(tasks);

    return {
      totalTasks,
      tasksByStatus,
      tasksByAssignee,
      overdueTasks
    };
  }

  calculateOverdueTasks(tasks) {
    const now = new Date();
    return tasks.filter(task => {
      return task.dueDate < now && task.status !== 'Done';
    }).length;
  }

  groupByStatus(tasks) {
    const statusCounts = {
      'To Do': 0,
      'In Progress': 0,
      'Done': 0
    };

    tasks.forEach(task => {
      if (statusCounts.hasOwnProperty(task.status)) {
        statusCounts[task.status]++;
      }
    });

    return statusCounts;
  }

  groupByAssignee(tasks) {
    const assigneeCounts = {};

    tasks.forEach(task => {
      if (task.assigneeId) {
        const assigneeId = task.assigneeId._id.toString();
        const assigneeName = task.assigneeId.name;
        
        if (!assigneeCounts[assigneeId]) {
          assigneeCounts[assigneeId] = {
            name: assigneeName,
            count: 0
          };
        }
        assigneeCounts[assigneeId].count++;
      } else {
        if (!assigneeCounts['unassigned']) {
          assigneeCounts['unassigned'] = {
            name: 'Unassigned',
            count: 0
          };
        }
        assigneeCounts['unassigned'].count++;
      }
    });

    return assigneeCounts;
  }
}

module.exports = new DashboardService();