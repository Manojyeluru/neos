const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('Environment setup:', { 
    hasUser: !!process.env.EMAIL_USER, 
    hasPass: !!process.env.EMAIL_PASS,
    nodeEnv: process.env.NODE_ENV 
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/authMiddleware');
const Event = require('./models/Event');
const User = require('./models/User');
const Team = require('./models/Team');
const ProblemStatement = require('./models/ProblemStatement');

const app = express();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-event-id'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Event Scoping Middleware
app.use(async (req, res, next) => {
    const eventIdStr = req.headers['x-event-id'];
    if (eventIdStr) {
        try {
            const event = await Event.findOne({ eventId: eventIdStr });
            if (event) {
                req.event = event;
            }
        } catch (err) {
            console.error("Event middleware error:", err);
        }
    }
    next();
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development/heavy usage
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/technical_event';

// Bind port IMMEDIATELY so Render doesn't timeout
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    
    // Connect to MongoDB after starting server
    mongoose.connect(MONGO_URI)
        .then(async () => {
            console.log('MongoDB Connected');
            // Seed default event if none exist
            const eventCount = await Event.countDocuments();
            if (eventCount === 0) {
                const defaultEvent = new Event({
                    eventId: 'default-symposium-2026',
                    name: 'Technical Symposium 2026',
                    description: 'Initial symposium event for technical evaluation and management testing.',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                    venue: 'Main Auditorium',
                    settings: {
                        eventStatus: 'Open',
                        minMembers: 1,
                        maxMembers: 5,
                        registrationType: 'Team',
                        isPaidEvent: false
                    }
                });
                await defaultEvent.save();
                console.log('Default event seeded for testing');
            }
        })
        .catch(err => console.error('MongoDB Connection Error. Please check your Atlas IP Whitelist:', err));
});

// Models
// Models already required at the top

// Routes preview (Implementation will follow)
app.get('/', (req, res) => res.send('API Running'));

// --- AUTH ROUTES ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// --- ADMIN ROUTES ---
const adminRoutes = require('./routes/admin');
app.use('/api/admin', authMiddleware(['admin', 'coordinator']), adminRoutes);

// --- TEAM ROUTES ---
const teamRoutes = require('./routes/team');
app.use('/api/team', authMiddleware(['teamleader', 'admin', 'coordinator']), teamRoutes);

// --- REVIEWER ROUTES ---
const reviewerRoutes = require('./routes/reviewer');
app.use('/api/reviewer', authMiddleware(['reviewer', 'admin', 'coordinator']), reviewerRoutes);

// --- ATTENDANCE ROUTES ---
const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

// --- VOTING ROUTES ---
const votingRoutes = require('./routes/voting');
app.use('/api/voting', votingRoutes);
