const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const ProblemStatement = require('../models/ProblemStatement');
const EventSettings = require('../models/EventSettings');

// Get event settings
router.get('/settings', async (req, res) => {
    try {
        if (req.event) {
            return res.json(req.event.settings);
        }
        
        if (req.user && req.user.uniqueId) {
            const team = await Team.findOne({ teamId: req.user.uniqueId }).populate('eventId');
            if (team && team.eventId) {
                return res.json(team.eventId.settings);
            }
        }
        
        const settings = await EventSettings.findOne();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get team info by Team ID
router.get('/info/:teamId', async (req, res) => {
    try {
        const team = await Team.findOne({ teamId: req.params.teamId })
            .populate('leaderId', 'name email phone institutionName year department')
            .populate('problemStatementId', 'title description');
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all problem statements
router.get('/problem-statements', async (req, res) => {
    try {
        const query = req.event ? { eventId: req.event._id } : {};
        const problems = await ProblemStatement.find(query);
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Team selects a problem statement (Only Once)
router.post('/select-problem', async (req, res) => {
    const { teamId, problemStatementId } = req.body;
    try {
        const team = await Team.findOne({ teamId });
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (team.locked) {
            return res.status(400).json({ message: 'Problem selection is locked' });
        }

        team.problemStatementId = problemStatementId;
        team.locked = true;
        await team.save();
        res.json({ message: 'Problem statement selected and locked' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload Project Details
router.post('/upload-project', async (req, res) => {
    const { teamId, videoUrl, description } = req.body;
    try {
        const team = await Team.findOne({ teamId });
        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Retrieve event to check if upload is open (req.event is set by event scope middleware)
        const eventId = req.event ? req.event._id : (await EventSettings.findOne())._id;
        const event = await require('../models/Event').findById(eventId);
        
        if (!event || !event.settings.isProjectUploadOpen) {
            return res.status(403).json({ message: 'Project upload phase is currently closed.' });
        }

        if (!videoUrl || !description) {
            return res.status(400).json({ message: 'Video URL and description are required.' });
        }

        team.project = {
            videoUrl,
            description,
            isUploaded: true
        };
        
        await team.save();
        res.json({ message: 'Project uploaded successfully!', project: team.project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
