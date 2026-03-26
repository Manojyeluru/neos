const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty'], required: true },
    votedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
}, { timestamps: true });

// Ensure a user can only vote once per event
VoterSchema.index({ eventId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Voter', VoterSchema);
