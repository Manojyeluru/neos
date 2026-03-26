const mongoose = require('mongoose');

const EventSettingsSchema = new mongoose.Schema({
    eventStatus: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    problemsReleased: { type: Boolean, default: false },
    totalRounds: { type: Number, default: 3 },
    minMembers: { type: Number, default: 1 },
    maxMembers: { type: Number, default: 5 },
    isPaidEvent: { type: Boolean, default: false },
    registrationFee: { type: Number, default: 0 },
    reviewersRequired: { type: Boolean, default: true },
    problemStatementsRequired: { type: Boolean, default: true },
    paymentDetails: {
        upiId: { type: String },
        bankName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        qrCodeUrl: { type: String }
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EventSettings', EventSettingsSchema);
