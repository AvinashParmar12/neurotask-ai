const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const initScheduler = require('./services/scheduler');

// Load env vars
dotenv.config();
// Boot sequence reload trigger

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
    console.log(`[API REQUEST] ${req.method} ${req.url}`);
}
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NeuroTask API is running' });
});

// Error handler
app.use(errorHandler);
 
// FRONTEND SERVING HERE
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initScheduler(); // Start AI Cron jobs
});
