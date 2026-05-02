const express = require('express');
const DashboardService = require('../services/DashboardService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/metrics', async (req, res) => {
  try {
    const metrics = await DashboardService.getDashboardMetrics(req.user.id);
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      error: {
        type: 'ServerError',
        message: 'Internal server error',
        statusCode: 500
      }
    });
  }
});

module.exports = router;