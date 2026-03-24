const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/technical_event';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Nexoss@Admin2026!', salt);

        await User.deleteMany({ $or: [{ username: 'admin' }, { uniqueId: 'ADMIN-001' }] });

        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            uniqueId: 'ADMIN-001',
            name: 'System Administrator'
        });
        await admin.save();
        console.log('Admin created successfully!');

        console.log('Username: admin');
        console.log('Password: Nexoss@Admin2026!');

        // Create Default Reviewer
        await User.deleteMany({ $or: [{ username: 'reviewer' }, { uniqueId: 'REV-001' }] });
        const reviewerSalt = await bcrypt.genSalt(10);
        const hashedReviewerPassword = await bcrypt.hash('reviewer123', reviewerSalt);

        const reviewer = new User({
            username: 'reviewer',
            email: 'reviewer@example.com',
            password: hashedReviewerPassword,
            role: 'reviewer',
            uniqueId: 'REV-001',
            name: 'Default Reviewer'
        });
        await reviewer.save();
        console.log('Reviewer created successfully!');
        console.log('Username: reviewer');
        console.log('Password: reviewer123');

        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err.message);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`${key}: ${err.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

createAdmin();
