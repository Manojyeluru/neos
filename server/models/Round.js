const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
    roundNumber: { type: Number, required: true },
    name: { type: String },
    active: { type: Boolean, default: false },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
}, { timestamps: true });

RoundSchema.index({ eventId: 1, roundNumber: 1 }, { unique: true });

module.exports = mongoose.model('Round', RoundSchema);
