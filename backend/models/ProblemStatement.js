const mongoose = require('mongoose');

const ProblemStatementSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
}, { timestamps: true });

module.exports = mongoose.model('ProblemStatement', ProblemStatementSchema);
