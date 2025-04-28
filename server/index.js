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

// CORS options with multiple allowed origins
const corsOptions = {
    origin: [
        'https://factory-project-rho.vercel.app', 
        'http://localhost:5173', 
        'http://localhost:5174',        
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies and authorization headers
};

// Middleware
app.use(cors(corsOptions)); // Use CORS middleware with multiple origins
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running');  // Basic message to confirm server is working
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);


// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
