const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true }, // e.g., 'tech-symp-2026'
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    venue: { type: String },
    clubLogo: { type: String },
    eventPoster: { type: String },
    settings: {
        eventStatus: { type: String, enum: ['Open', 'Closed', 'Completed'], default: 'Open' },
        registrationType: { type: String, enum: ['Single', 'Team'], default: 'Team' },
        problemsReleased: { type: Boolean, default: false },
        totalRounds: { type: Number, default: 3 },
        minMembers: { type: Number, default: 1 },
        maxMembers: { type: Number, default: 5 },
        maxTeams: { type: Number, default: 100 },
        maxParticipants: { type: Number, default: 500 },
        isPaidEvent: { type: Boolean, default: false },
        registrationFee: { type: Number, default: 0 },
        reviewersRequired: { type: Boolean, default: true },
        problemStatementsRequired: { type: Boolean, default: true },
        isAttendanceOpen: { type: Boolean, default: false },
        attendanceEndTime: { type: Date },
        isProjectUploadOpen: { type: Boolean, default: false },
        isVotingOpen: { type: Boolean, default: false },
        whatsappLink: { type: String },
        emailSettings: {
            user: { type: String },
            pass: { type: String }
        },
        paymentDetails: {
            upiId: { type: String },
            bankName: { type: String },
            accountNumber: { type: String },
            ifscCode: { type: String },
            qrCodeUrl: { type: String }
        }
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
