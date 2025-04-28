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


app.use(
    cors({
        origin: [
            'https://factory-project-rho.vercel.app',
            'http://localhost:5174'
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);


app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send("Server is working");
});
app.get("/api", (req, res) => {
    res.status(200).send("Testing base URI");
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);


// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
