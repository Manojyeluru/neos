const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String }, // Optional: not required for Google-authenticated users
    role: { type: String, enum: ['admin', 'reviewer', 'teamleader', 'coordinator'], required: true },
    uniqueId: { type: String, required: true, unique: true }, // Admin ID, Reviewer ID, or Team ID
    name: { type: String, required: true },
    googleUid: { type: String }, // Firebase UID for Google-authenticated users
    regNo: { type: String }, // For Team Leaders
    phone: { type: String }, // Added Phone Number

    // Additional Registration Fields
    year: { type: String }, // 1, 2, 3, 4
    department: { type: String },
    collegeType: { type: String, enum: ['KARE', 'Other'] },
    residenceType: { type: String, enum: ['Hostler', 'Dayscholor'] },
    hostelNumber: { type: String }, // MH1-8, LH1-5
    collegeName: { type: String },

    // Magic Link
    magicToken: { type: String },
    magicTokenExpiry: { type: Date },

    // Password Reset
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
}, { timestamps: true });

// Add indexing for scalability
// Note: unique: true already creates indexes for email, username, and uniqueId

module.exports = mongoose.model('User', UserSchema);
