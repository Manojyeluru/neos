const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Round = require('../models/Round');
const Criteria = require('../models/Criteria');
const User = require('../models/User');

// Get all rounds
router.get('/rounds', async (req, res) => {
    try {
        const query = req.event ? { eventId: req.event._id } : {};
        const rounds = await Round.find(query).sort({ roundNumber: 1 });
        res.json(rounds);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get criteria for a specific round
router.get('/criteria/:roundNum', async (req, res) => {
    try {
        const query = req.event ? { eventId: req.event._id, roundNumber: req.params.roundNum } : { roundNumber: req.params.roundNum };
        const criteria = await Criteria.find(query);
        res.json(criteria);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all teams for review with problem statements
router.get('/teams', async (req, res) => {
    try {
        const query = req.event ? { eventId: req.event._id } : {};
        const teams = await Team.find(query)
            .populate('problemStatementId', 'title description')
            .populate('leaderId', 'name institutionName');
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit marks with criteria
router.post('/submit-review', async (req, res) => {
    const { teamId, reviewerId, reviewerName, roundNumber, criteriaScores, comments } = req.body;
    try {
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Calculate total marks
        const totalMarks = criteriaScores.reduce((sum, c) => sum + (Number(c.marks) || 0), 0);

        // Check if this specific reviewer name already submitted for this round
        const existingScoreIndex = team.scores.findIndex(s =>
            s.roundNumber === roundNumber &&
            s.reviewerId.toString() === reviewerId &&
            s.reviewerName === reviewerName
        );

        if (existingScoreIndex > -1) {
            return res.status(400).json({ message: `Reviewer ${reviewerName} has already submitted for this round.` });
        }

        team.scores.push({
            roundNumber,
            criteriaScores,
            totalMarks,
            reviewerId,
            reviewerName,
            comments,
            timestamp: Date.now()
        });

        await team.save();
        res.json({ message: 'Review submitted successfully', totalMarks });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all reviewers assigned to the event
router.get('/reviewers', async (req, res) => {
    try {
        const query = req.event ? { role: 'reviewer', eventId: req.event._id } : { role: 'reviewer' };
        const reviewers = await User.find(query).select('name email uniqueId department').lean();
        res.json(reviewers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
