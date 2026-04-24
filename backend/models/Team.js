const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamId: { type: String, required: true, unique: true },
    teamName: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        name: { type: String, required: true },
        regNo: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        collegeName: { type: String },
        collegeType: { type: String, enum: ['KARE', 'Other'] },
        residenceType: { type: String, enum: ['Hostler', 'Dayscholor'] },
        hostelNumber: { type: String },
        department: { type: String },
        year: { type: String },
        faceDescriptors: [{ type: [Number] }], // Store up to 6-8 facial descriptors
        isPresent: { type: Boolean, default: false }
    }],
    problemStatementId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemStatement' },
    locked: { type: Boolean, default: false },
    project: {
        videoUrl: { type: String },
        description: { type: String },
        isUploaded: { type: Boolean, default: false }
    },
    votes: { type: Number, default: 0 },
    scores: [{
        roundNumber: { type: Number },
        criteriaScores: [{
            name: { type: String },
            marks: { type: Number }
        }],
        totalMarks: { type: Number },
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewerName: { type: String },
        comments: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    paymentStatus: { type: String, enum: ['Free', 'Pending', 'Verified', 'Rejected'], default: 'Free' },
    paymentReference: { type: String },
    paymentReceipt: { type: String }, // URL to the screenshot
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

// Add indexing for scalability
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ problemStatementId: 1 });

module.exports = mongoose.model('Team', TeamSchema);
