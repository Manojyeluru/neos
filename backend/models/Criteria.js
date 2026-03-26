const mongoose = require('mongoose');

const CriteriaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    maxMarks: { type: Number, required: true },
    roundNumber: { type: Number, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
}, { timestamps: true });

module.exports = mongoose.model('Criteria', CriteriaSchema);
