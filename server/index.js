const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

// Connect to database
connectDB();

// Initialize express app
const app = express();

// CORS options
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Manually handle preflight (OPTIONS) requests globally
app.options('*', cors(corsOptions));

// Health check
app.get('/', (req, res) => {
    res.status(200).send('API is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export app for Vercel
module.exports = app;
