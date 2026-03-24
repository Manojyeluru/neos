const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Team = require('../models/Team');
const Voter = require('../models/Voter');
const admin = require('firebase-admin'); // Firebase admin is already initialized in auth.js

// --- VOTING AUTHENTICATION (Google Login via Firebase) ---
router.post('/auth', async (req, res) => {
    const { idToken, eventId } = req.body;
    
    if (!idToken || !eventId) {
        return res.status(400).json({ message: 'Missing token or eventId.' });
    }

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const { email, name } = decoded;

        if (!email || !email.endsWith('@klu.ac.in')) {
            return res.status(403).json({ message: 'Access denied. Only @klu.ac.in emails are allowed to vote.' });
        }

        const event = await Event.findById(eventId);
        if (!event || !event.settings.isVotingOpen) {
            return res.status(403).json({ message: 'Voting is currently closed for this event.' });
        }

        // Determine Role
        const usernamePart = email.split('@')[0];
        const isStudent = /^\d+$/.test(usernamePart);
        const role = isStudent ? 'student' : 'faculty';

        // Check if voter exists, else create
        let voter = await Voter.findOne({ email, eventId });
        if (!voter) {
            voter = new Voter({ email, eventId, role });
            await voter.save();
        }

        res.json({
            message: 'Authenticated successfully',
            voter: {
                id: voter._id,
                email: voter.email,
                role: voter.role,
                votedProjects: voter.votedProjects
            }
        });
    } catch (err) {
        console.error('Voting Auth Error:', err);
        res.status(401).json({ message: 'Authentication failed.' });
    }
});

// --- GET PROJECTS FOR VOTING ---
router.get('/projects/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event || !event.settings.isVotingOpen) {
            return res.status(403).json({ message: 'Voting is not open.' });
        }

        // Only return projects that have been uploaded
        const teams = await Team.find({ eventId: req.params.eventId, 'project.isUploaded': true })
            .select('teamName project problemStatementId leaderId votes')
            .populate('problemStatementId', 'title')
            .lean();

        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- SUBMIT VOTES ---
router.post('/submit', async (req, res) => {
    const { email, eventId, teamIds } = req.body; // teamIds should be an array of max 3 IDs

    if (!email || !eventId || !teamIds || !Array.isArray(teamIds) || teamIds.length === 0 || teamIds.length > 3) {
        return res.status(400).json({ message: 'Invalid vote submission. You can vote for 1 to 3 projects.' });
    }

    try {
        const event = await Event.findById(eventId);
        if (!event || !event.settings.isVotingOpen) {
            return res.status(403).json({ message: 'Voting is currently closed.' });
        }

        const voter = await Voter.findOne({ email, eventId });
        if (!voter) {
            return res.status(404).json({ message: 'Voter not found. Please authenticate first.' });
        }

        if (voter.votedProjects && voter.votedProjects.length > 0) {
            return res.status(400).json({ message: 'You have already submitted your votes for this event.' });
        }

        const votePoints = voter.role === 'faculty' ? 10 : 1;

        // Verify all teams exist and have uploaded projects
        const teams = await Team.find({ _id: { $in: teamIds }, eventId, 'project.isUploaded': true });
        if (teams.length !== teamIds.length) {
            return res.status(400).json({ message: 'One or more selected projects are invalid or not uploaded yet.' });
        }

        // Apply votes
        for (let team of teams) {
            team.votes = (team.votes || 0) + votePoints;
            await team.save();
        }

        // Mark voter as voted
        voter.votedProjects = teamIds;
        await voter.save();

        res.json({ message: 'Votes submitted successfully!', votedProjects: teamIds });
    } catch (err) {
        console.error('Vote Submission Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
