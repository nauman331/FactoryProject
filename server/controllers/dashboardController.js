const Job = require('../models/Job');
const User = require('../models/Job');

exports.getDashboardData = async (req, res) => {
  try {
    // Fetch the count of pending and completed jobs
    const completedJobsCount = await Job.countDocuments({ status: 'completed' });
    const pendingJobsCount = await Job.countDocuments({ status: 'pending' });

    // Fetch the count of users (you could use roles if needed to filter)
    const totalUsersCount = await User.countDocuments();

    // Get the start of today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of the day

    // Fetch job statistics (orders and workers) per day using the native JavaScript Date object
    const jobsPerDay = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' }, // Group by day of the week
          totalOrders: { $sum: 1 }, // Count the total jobs created per day
        },
      },
    ]);

    const workersPerDay = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $lookup: {
          from: 'users', // assuming 'users' is the collection name for User model
          localField: 'createdBy',
          foreignField: '_id',
          as: 'workers',
        },
      },
      {
        $unwind: '$workers',
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' }, // Group by day of the week
          totalWorkers: { $sum: 1 }, // Count the workers per day
        },
      },
    ]);

    // Prepare data for the frontend
    const dashboardData = {
      completedJobsCount,
      pendingJobsCount,
      totalUsersCount,
      jobsPerDay,
      workersPerDay,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};
