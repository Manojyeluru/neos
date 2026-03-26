const express = require('mongoose');
const router = require('express').Router();
const Team = require('../models/Team');
const Event = require('../models/Event');
const authMiddleware = require('../middleware/authMiddleware');

// --- FACE REGISTRATION FOR PARTICIPANTS ---
router.post('/register-face', async (req, res) => {
    try {
        const { teamId, email, descriptors } = req.body;
        if (!teamId || !email || !descriptors || !Array.isArray(descriptors)) {
            return res.status(400).json({ message: 'Missing required face registration payload' });
        }

        const team = await Team.findOne({ teamId });
        if (!team) return res.status(404).json({ message: 'Team not found' });

        const memberIndex = team.members.findIndex(m => m.email === email);
        if (memberIndex === -1) return res.status(404).json({ message: 'Participant not found in this team' });

        // Update the member's face descriptors
        team.members[memberIndex].faceDescriptors = descriptors;
        await team.save();

        res.json({ message: 'Face ID registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// --- ADMIN CONTROL: GET ATTENDANCE STATUS ---
router.get('/status', authMiddleware(['admin', 'coordinator']), async (req, res) => {
    try {
        if (!req.event) return res.status(400).json({ message: 'Event not specified' });
        res.json({
            isAttendanceOpen: req.event.settings.isAttendanceOpen,
            attendanceEndTime: req.event.settings.attendanceEndTime
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ADMIN CONTROL: TOGGLE ATTENDANCE WINDOW ---
router.post('/toggle-window', authMiddleware(['admin', 'coordinator']), async (req, res) => {
    try {
        const { durationMinutes, action } = req.body; // action = 'start' or 'stop'
        if (!req.event) return res.status(400).json({ message: 'Event not specified' });

        if (action === 'start') {
            const end = new Date(Date.now() + (durationMinutes || 60) * 60000);
            await Event.findByIdAndUpdate(req.event._id, {
                $set: {
                    'settings.isAttendanceOpen': true,
                    'settings.attendanceEndTime': end
                }
            });
            return res.json({ message: 'Attendance window opened', endTime: end });
        } else if (action === 'stop') {
            await Event.findByIdAndUpdate(req.event._id, {
                $set: {
                    'settings.isAttendanceOpen': false,
                    'settings.attendanceEndTime': null
                }
            });

            // Mark everyone not present as absent - handled automatically by default false on schema
            // but we might want to flag them if we need explicit tracking. Given defaults:
            // isPresent automatically defaults to false on the schema.
            return res.json({ message: 'Attendance window closed' });
        }

        res.status(400).json({ message: 'Invalid action' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ADMIN CONTROL: MANUAL CHECK-IN VIA REG NO ---
router.post('/manual-checkin', authMiddleware(['admin', 'coordinator']), async (req, res) => {
    try {
        const { regNo } = req.body;
        if (!regNo) return res.status(400).json({ message: 'Registration number required' });

        const team = await Team.findOne({ 'members.regNo': regNo, eventId: req.event?._id });
        if (!team) return res.status(404).json({ message: 'Participant not found with this Registration ID' });

        const memberIndex = team.members.findIndex(m => m.regNo === regNo);
        if (memberIndex === -1) return res.status(404).json({ message: 'Participant member error' });

        if (team.members[memberIndex].isPresent) {
            return res.status(400).json({ message: 'Participant is already marked Present' });
        }

        team.members[memberIndex].isPresent = true;
        await team.save();

        res.json({ message: 'Marked present manually', member: team.members[memberIndex] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ADMIN CONTROL: BULK FACE CHECK-IN ---
router.post('/bulk-face-checkin', authMiddleware(['admin', 'coordinator']), async (req, res) => {
    try {
        // Here we could either receive descriptors and match on backend,
        // or accept a list of matched emails/regNos from the frontend.
        // It's much less CPU intensive to match using face-api.js on the frontend
        // and just send the identified emails to this route for updating.
        const { emails } = req.body; 
        if (!emails || !Array.isArray(emails)) return res.status(400).json({ message: 'Missing array of detected emails' });

        // Note: For a live feed, front end can batch send every 5 seconds.
        const result = { marked: [], alreadyPresent: [] };
        
        for (let email of emails) {
            const team = await Team.findOne({ 'members.email': email, eventId: req.event?._id });
            if (team) {
                const idx = team.members.findIndex(m => m.email === email);
                if (idx !== -1) {
                    if (!team.members[idx].isPresent) {
                        team.members[idx].isPresent = true;
                        // Avoid triggering pre save hooks if not modified deeply? Mongoose handles array doc updates fine
                        await team.save();
                        result.marked.push(email);
                    } else {
                        result.alreadyPresent.push(email);
                    }
                }
            }
        }

        res.json({ message: 'Attendance sync complete', result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- GET ALL REGISTERED FACES FOR MATCHING ---
router.get('/faces', authMiddleware(['admin', 'coordinator']), async (req, res) => {
    try {
        const teams = await Team.find({ eventId: req.event?._id }).lean();
        const faces = [];
        
        teams.forEach(team => {
            team.members.forEach(member => {
                if (member.faceDescriptors && member.faceDescriptors.length > 0) {
                    faces.push({
                        label: member.email,
                        name: member.name,
                        regNo: member.regNo,
                        descriptors: member.faceDescriptors // [[Numbers]]
                    });
                }
            });
        });

        res.json(faces);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ADMIN CONTROL: GET ATTENDANCE LIST ---
router.get('/list', authMiddleware(['admin', 'coordinator']), async (req, res) => {
    try {
        const teams = await Team.find({ eventId: req.event?._id }).lean();
        const present = [];
        const absent = [];
        
        teams.forEach(team => {
            team.members.forEach(m => {
                if (m.isPresent) {
                    present.push({ name: m.name, regNo: m.regNo, email: m.email, teamName: team.teamName });
                } else {
                    absent.push({ name: m.name, regNo: m.regNo, email: m.email, teamName: team.teamName });
                }
            });
        });

        res.json({ present, absent });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
