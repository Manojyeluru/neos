const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Team = require('../models/Team');
const User = require('../models/User');
const ProblemStatement = require('../models/ProblemStatement');
const Round = require('../models/Round');
const Criteria = require('../models/Criteria');
const EventSettings = require('../models/EventSettings');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

const upload = multer({ dest: 'uploads/' });

const Event = require('../models/Event');
const Voter = require('../models/Voter');

// --- EVENTS ---
const eventUpload = upload.fields([
    { name: 'clubLogo', maxCount: 1 },
    { name: 'eventPoster', maxCount: 1 }
]);

router.get('/events', async (req, res) => {
    try {
        const events = await Event.find().populate('admins', 'name email').lean();

        // Enhance events with stats
        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const teamsCount = await Team.countDocuments({ eventId: event._id });
            const teams = await Team.find({ eventId: event._id });
            const participantsCount = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);
            
            // Calculate total generated amount
            // If the fee is per participant (suggested by user request), we multiply.
            // For now, let's assume registrationFee is per team if not specified, 
            // but the user wants "based on participants". 
            // Let's calculate it both ways or just use the fee * participants if that's the intent.
            // Actually, usually it's per team. But user said "read the amount based on participants".
            // So if fee is 100 and 5 members, it's 500.
            const totalGeneratedAmount = teams.reduce((sum, t) => {
                const fee = event.settings?.registrationFee || 0;
                return sum + (fee * (t.members?.length || 1));
            }, 0);

            return {
                ...event,
                teamsCount,
                participantsCount,
                totalGeneratedAmount
            };
        }));

        res.json(eventsWithStats);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/events', eventUpload, async (req, res) => {
    try {
        const { eventId, name, description, startDate, endDate, venue, settings } = req.body;
        const parsedSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;

        // Build the update object with only provided fields to prevent accidental overwrites
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (venue !== undefined) updateData.venue = venue;
        
        if (parsedSettings !== undefined) {
            // Ensure registrationFee is a number and not NaN
            if (parsedSettings.registrationFee !== undefined) {
                const fee = parseFloat(parsedSettings.registrationFee);
                parsedSettings.registrationFee = isNaN(fee) ? 0 : fee;
            }
            updateData.settings = parsedSettings;
        }
        
        // Only include dates if they are provided (prevent null/invalid date conversion if empty)
        if (startDate) updateData.startDate = startDate;
        if (endDate) updateData.endDate = endDate;

        if (req.files) {
            if (req.files['clubLogo']) {
                updateData.clubLogo = `/uploads/${req.files['clubLogo'][0].filename}`;
            }
            if (req.files['eventPoster']) {
                updateData.eventPoster = `/uploads/${req.files['eventPoster'][0].filename}`;
            }
        }

        const event = await Event.findOneAndUpdate(
            { eventId },
            { $set: updateData }, // Explicitly use $set to be safe, though Mongoose does this by default
            { upsert: true, new: true }
        );
        res.json(event);
    } catch (err) { 
        console.error("Event update error:", err);
        res.status(500).json({ message: err.message }); 
    }
});

router.get('/events/:id', async (req, res) => {
    try {
        const event = await Event.findOne({ eventId: req.params.id }).populate('admins', 'name email').lean();
        res.json(event);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/events/:id', async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ eventId: req.params.id });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        // Optionally delete associated teams, users, rounds, etc.
        await Team.deleteMany({ eventId: event._id });
        await User.deleteMany({ eventId: event._id, role: { $ne: 'admin' } });
        await Round.deleteMany({ eventId: event._id });
        await Criteria.deleteMany({ eventId: event._id });
        await ProblemStatement.deleteMany({ eventId: event._id });

        res.json({ message: 'Event deleted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- MAGIC LINK HELPER ---
const generateMagicToken = () => crypto.randomBytes(32).toString('hex');

// --- ROUNDS & CRITERIA ---
router.post('/rounds', async (req, res) => {
    try {
        if (!req.event) return res.status(400).json({ message: 'CRITICAL ERROR: No event selected for management.' });
        const { roundNumber, name, active } = req.body;
        const round = await Round.findOneAndUpdate(
            { roundNumber, eventId: req.event._id },
            { name, active, eventId: req.event._id },
            { upsert: true, new: true }
        );
        res.json(round);
    } catch (err) { 
        console.error("Round creation error:", err);
        res.status(500).json({ message: "Failed to deploy evaluation phase: " + err.message }); 
    }
});

router.get('/rounds', async (req, res) => {
    try {
        if (!req.event) return res.status(400).json({ message: 'CRITICAL ERROR: No event selected.' });
        const rounds = await Round.find({ eventId: req.event._id }).sort({ roundNumber: 1 }).lean();
        const roundsWithStats = await Promise.all(rounds.map(async (round) => {
            const criteria = await Criteria.find({ roundNumber: round.roundNumber, eventId: req.event._id });
            const totalMaxMarks = criteria.reduce((sum, c) => sum + (c.maxMarks || 0), 0);
            return {
                ...round,
                criteriaCount: criteria.length,
                totalMaxMarks
            };
        }));
        res.json(roundsWithStats);
    } catch (err) { res.status(500).json({ message: "Failed to intercept phase data: " + err.message }); }
});

router.delete('/rounds/:id', async (req, res) => {
    try {
        await Round.findByIdAndDelete(req.params.id);
        res.json({ message: 'Round deleted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/criteria', async (req, res) => {
    try {
        if (!req.event) return res.status(400).json({ message: 'CRITICAL ERROR: Event context required.' });
        const { name, description, maxMarks, roundNumber } = req.body;
        if (!name || isNaN(maxMarks)) return res.status(400).json({ message: 'Invalid criteria data: Missing protocol parameters.' });

        const criteria = new Criteria({ name, description: description || '', maxMarks, roundNumber, eventId: req.event._id });
        await criteria.save();
        res.json(criteria);
    } catch (err) { res.status(500).json({ message: "Criteria deployment failed: " + err.message }); }
});

router.put('/criteria/:id', async (req, res) => {
    try {
        const { name, description, maxMarks } = req.body;
        const criteria = await Criteria.findByIdAndUpdate(
            req.params.id,
            { name, description: description || '', maxMarks },
            { new: true }
        );
        res.json(criteria);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/criteria/:roundNumber', async (req, res) => {
    try {
        const criteria = await Criteria.find({
            roundNumber: parseInt(req.params.roundNumber),
            eventId: req.event?._id
        });
        res.json(criteria);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/criteria/:id', async (req, res) => {
    try {
        await Criteria.findByIdAndDelete(req.params.id);
        res.json({ message: 'Criteria deleted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Helper to initialize default Round 1 criteria
router.post('/criteria/initialize-defaults', async (req, res) => {
    const { roundNumber } = req.body;
    const defaults = [
        { name: 'Innovation & Originality', maxMarks: 20 },
        { name: 'Technical Complexity', maxMarks: 30 },
        { name: 'Execution & Working', maxMarks: 25 },
        { name: 'Presentation & UI/UX', maxMarks: 15 },
        { name: 'Impact & Scalability', maxMarks: 10 }
    ];
    try {
        const criteria = await Promise.all(defaults.map(d =>
            new Criteria({ ...d, roundNumber }).save()
        ));
        res.json(criteria);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- STATS ---
router.get('/stats', async (req, res) => {
    try {
        const eventFilter = req.event?._id ? { eventId: req.event._id } : {};
        const [teamsCount, reviewersCount, roundsCount, problemsCount, allTeams] = await Promise.all([
            Team.countDocuments(eventFilter),
            User.countDocuments({ role: 'reviewer' }),
            Round.countDocuments(eventFilter),
            ProblemStatement.countDocuments(eventFilter),
            Team.find(eventFilter, 'members')
        ]);

        const totalMembers = allTeams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

        res.json({
            teams: teamsCount,
            reviewers: reviewersCount,
            rounds: roundsCount,
            problems: problemsCount,
            members: totalMembers
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- TEAMS & DASHBOARD ---
router.get('/teams', async (req, res) => {
    try {
        const teams = await Team.find({ eventId: req.event?._id })
            .populate('leaderId', 'name email institutionName')
            .populate('problemStatementId', 'title');
        res.json(teams);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- APPROVE / REJECT TEAM ---
router.patch('/teams/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // 'Approved' | 'Rejected' | 'Pending'
        if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: `Team ${status.toLowerCase()} successfully`, team });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- UPDATE PAYMENT STATUS ---
router.patch('/teams/:id/payment', async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        if (!['Free', 'Pending', 'Verified', 'Rejected'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true }
        );
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: `Payment status updated to ${paymentStatus}`, team });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/teams/all', async (req, res) => {
    try {
        const eventId = req.event?._id;
        if (!eventId) return res.status(400).json({ message: 'Event not found' });
        await Team.deleteMany({ eventId });
        res.json({ message: 'All teams have been deleted successfully.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- DELETE SINGLE TEAM ---
router.delete('/teams/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: 'Team deleted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- UPDATE TEAM PROBLEM ---
router.patch('/update-team-problem', async (req, res) => {
    try {
        const { teamId, problemStatementId } = req.body;
        const team = await Team.findOneAndUpdate(
            { teamId },
            { problemStatementId: problemStatementId || null },
            { new: true }
        );
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: 'Problem updated', team });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- EDIT TEAM MEMBERS / TEAM NAME ---
router.patch('/teams/:id/edit', async (req, res) => {
    try {
        const { teamName, members } = req.body;
        const updateData = {};
        if (teamName) updateData.teamName = teamName;
        if (members) updateData.members = members;
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('leaderId', 'name email');
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: 'Team updated successfully', team });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- MANUAL TEAM REGISTRATION (Special Request) ---
router.post('/teams/manual-add', async (req, res) => {
    const { teamName, members, problemStatementId } = req.body;
    try {
        if (!req.event) return res.status(404).json({ message: 'Event not found' });
        const event = req.event;
        const leader = members[0];

        const allEmails = [leader.email];
        if (members && members.length > 0) {
            members.forEach(m => {
                if (m.email && m.email !== leader.email) allEmails.push(m.email);
            });
        }

        // Check if existing leader or member is already registered in this event
        // let existingUser = await User.findOne({
        //     email: { $in: allEmails },
        //     eventId: event._id
        // });

        // let existingTeamMember = await Team.findOne({
        //     eventId: event._id,
        //     'members.email': { $in: allEmails }
        // });

        // if (existingUser || existingTeamMember) return res.status(400).json({ message: 'One or more members are already registered for this event' });

        const uniqueId = `TEAM-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Generating a dummy password that they can reset or use magic login
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('team@123', salt);

        let newUser = new User({
            username: `${event.eventId}_${leader.email}_${Date.now()}`,
            email: leader.email,
            password: hashedPassword,
            role: 'teamleader',
            uniqueId,
            name: leader.name,
            regNo: leader.regNo,
            phone: leader.phone,
            year: leader.year,
            department: leader.department,
            collegeType: leader.collegeType,
            residenceType: leader.residenceType,
            hostelNumber: leader.hostelNumber,
            collegeName: leader.collegeName || 'KARE',
            eventId: event._id
        });

        try {
            await newUser.save();
        } catch (err) {
            if (err.code === 11000) {
                const existingUser = await User.findOne({ email: leader.email });
                if (existingUser) {
                    newUser = existingUser;
                } else {
                    throw err;
                }
            } else {
                throw err;
            }
        }

        const newTeam = new Team({
            teamId: uniqueId,
            teamName: teamName || `${leader.name}'s Team`,
            leaderId: newUser._id,
            eventId: event._id,
            members: members.map(m => ({
                ...m,
                collegeName: m.collegeName || (m.collegeType === 'Other' ? '' : 'KARE')
            })),
            problemStatementId: problemStatementId || undefined,
            status: 'Approved', // Auto-approved since admin is manually adding
            paymentStatus: 'Free'
        });
        await newTeam.save();

        res.status(201).json({ message: 'Team registered successfully', team: newTeam });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



router.get('/leaderboard', async (req, res) => {
    try {
        const teams = await Team.find({ eventId: req.event?._id })
            .populate('leaderId', 'name institutionName')
            .lean();

        // Calculate total score for each team
        const rankedTeams = teams.map(team => {
            const totalScore = team.scores.reduce((sum, score) => sum + (score.totalMarks || 0), 0);
            return { ...team, totalScore };
        }).sort((a, b) => b.totalScore - a.totalScore);

        res.json(rankedTeams);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/problem-statements', async (req, res) => {
    try {
        const { id, title, description, category } = req.body;
        const problem = new ProblemStatement({ id, title, description, category, eventId: req.event?._id });
        await problem.save();
        res.json(problem);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/problem-statements', async (req, res) => {
    try {
        const problems = await ProblemStatement.find({ eventId: req.event?._id });
        res.json(problems);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/problem-statements/:id', async (req, res) => {
    try {
        const problem = await ProblemStatement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(problem);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/problem-statements/:id', async (req, res) => {
    try {
        await ProblemStatement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Problem deleted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- BULK UPLOAD PROBLEMS ---
router.post('/upload-problems', upload.single('file'), async (req, res) => {
    try {
        const workbook = xlsx.readFile(req.file.path);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        for (let row of data) {
            await ProblemStatement.findOneAndUpdate(
                { id: row.id || row.title },
                {
                    title: row.title,
                    description: row.description,
                    category: row.category || row.difficulty || 'General'
                },
                { upsert: true }
            );
        }
        res.json({ message: 'Problems uploaded successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- REVIEWER MANAGEMENT ---
router.get('/reviewers', async (req, res) => {
    try {
        const query = { role: 'reviewer' };
        // If event is scoped, show event-specific reviewers OR global ones?
        // Let's show all for now, but filter assignments by event.
        if (req.event) {
            query.$or = [{ eventId: req.event._id }, { eventId: { $exists: false } }, { eventId: null }];
        }

        const reviewers = await User.find(query).select('-password').lean();
        
        const reviewersWithStats = await Promise.all(reviewers.map(async (rev) => {
            const assignmentQuery = { 'scores.reviewerId': rev._id };
            if (req.event) {
                assignmentQuery.eventId = req.event._id;
            }
            const teamsAssigned = await Team.countDocuments(assignmentQuery);
            return {
                ...rev,
                id: rev.uniqueId,
                teamsAssigned
            };
        }));
        res.json(reviewersWithStats);
    } catch (err) { 
        console.error("Error in GET /reviewers:", err);
        res.status(500).json({ message: "Strategic override failed: " + err.message }); 
    }
});

router.post('/add-reviewer', async (req, res) => {
    const { name, email, password, expertise, sendLoginLink } = req.body;
    try {
        const existing = await User.findOne({ $or: [{ email }, { username: email }] });
        if (existing) return res.status(400).json({ message: 'User with this email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const uniqueId = `REV-${Math.floor(1000 + Math.random() * 9000)}`;
        const magicToken = generateMagicToken();

        const reviewer = await User.create({
            username: email,
            email,
            password: hashedPassword,
            role: 'reviewer',
            uniqueId,
            name,
            department: expertise,
            magicToken,
            magicTokenExpiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            eventId: req.event?._id
        });

        if (sendLoginLink) {
            const loginUrl = `${process.env.FRONTEND_URL}/reviewer/magic-login?token=${magicToken}`;
            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #3b82f6;">Technical Symposium 2026</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>You have been commissioned as a <strong>Reviewer</strong> for the symposium.</p>
                    <p>Your Reviewer ID: <strong>${uniqueId}</strong></p>
                    <p>You can log in using the special link below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Mission Dashboard Login</a>
                    </div>
                    <p>Alternatively, you can use your email and Reviewer ID at the portal.</p>
                    <p style="color: #666; font-size: 12px;">This link will expire in 7 days.</p>
                </div>
            `;
            sendEmail(email, 'Your Reviewer Access Credentials - Technical Symposium 2026', html, req.event?.settings?.emailSettings)
                .catch(err => console.error('Background Reviewer Mail Error:', err.message));
        }

        res.json({ message: 'Reviewer added successfully', uniqueId, id: reviewer._id });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'User with these credentials already exists' });
        }
        res.status(500).json({ message: err.message });
    }
});

router.post('/reviewers/:id/generate-link', async (req, res) => {
    try {
        const magicToken = generateMagicToken();
        const reviewer = await User.findByIdAndUpdate(req.params.id, {
            magicToken,
            magicTokenExpiry: Date.now() + 7 * 24 * 60 * 60 * 1000
        }, { new: true });

        if (!reviewer) return res.status(404).json({ message: 'Reviewer not found' });

        const loginUrl = `${process.env.FRONTEND_URL}/reviewer/magic-login?token=${magicToken}`;
        res.json({ loginUrl });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/reviewers/:id', async (req, res) => {
    const { name, email, expertise } = req.body;
    try {
        const updateData = { name, email, department: expertise };
        const reviewer = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!reviewer) return res.status(404).json({ message: 'Reviewer not found' });
        res.json({ message: 'Reviewer updated successfully', reviewer });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/reviewers/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Reviewer removed successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/settings', async (req, res) => {
    try {
        if (!req.event) return res.status(400).json({ message: 'MISSION FAILURE: No event specified in signal headers.' });
        res.json(req.event.settings);
    } catch (err) { res.status(500).json({ message: "Signal interference: " + err.message }); }
});

router.post('/settings', async (req, res) => {
    try {
        if (!req.event) return res.status(404).json({ message: 'Event not specified' });
        const event = await Event.findByIdAndUpdate(
            req.event._id,
            { $set: { settings: req.body } },
            { new: true }
        );
        res.json(event.settings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/export-teams', async (req, res) => {
    try {
        const query = req.event ? { eventId: req.event._id } : {};
        const teams = await Team.find(query)
            .populate('leaderId', 'name email')
            .populate('problemStatementId', 'title')
            .lean();

        const rows = [];
        teams.forEach((team, teamIdx) => {
            team.members.forEach((member, memberIdx) => {
                rows.push({
                    'Team ID': team.teamId,
                    'Team Name': team.teamName,
                    'Problem ID': team.problemStatementId?.id || team.problemStatementId || 'N/A',
                    'Payment Status': team.paymentStatus,
                    'Member Type': memberIdx === 0 ? 'Leader' : 'Member',
                    'Name': member.name,
                    'Registration Number': member.regNo,
                    'Phone Number': member.phone || 'N/A',
                    'Email': member.email,
                    'College Type': member.collegeType,
                    'College Name': member.collegeName,
                    'Residence Type': member.residenceType || 'N/A',
                    'Hostel Number': member.hostelNumber || 'N/A',
                    'Department': member.department,
                    'Year': member.year
                });
            });
            // Add an empty row between teams for better readability
            rows.push({});
        });

        const worksheet = xlsx.utils.json_to_sheet(rows);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- TOGGLE VOTING/PROJECT PHASES ---
router.post('/toggle-phases', async (req, res) => {
    try {
        if (!req.event) return res.status(400).json({ message: 'Event not specified' });
        const { isProjectUploadOpen, isVotingOpen } = req.body;
        
        const updateFields = {};
        if (isProjectUploadOpen !== undefined) updateFields['settings.isProjectUploadOpen'] = isProjectUploadOpen;
        if (isVotingOpen !== undefined) updateFields['settings.isVotingOpen'] = isVotingOpen;

        const event = await Event.findByIdAndUpdate(
            req.event._id,
            { $set: updateFields },
            { new: true }
        );

        res.json({ 
            message: 'Phase settings updated successfully', 
            settings: event.settings 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- GET VOTING RESULTS ---
router.get('/voting-results', async (req, res) => {
    try {
        if (!req.event) return res.status(400).json({ message: 'Event not specified' });
        
        const eventId = req.event._id;

        // Fetch all voters for this event
        const voters = await Voter.find({ eventId });
        
        let totalVotes = 0;
        let studentsCount = 0;
        let facultiesCount = 0;

        voters.forEach(voter => {
            if (voter.votedProjects && voter.votedProjects.length > 0) {
                totalVotes += voter.votedProjects.length; // Or just count voters? "no. of votes" might mean total points or total ballots cast. Let's count ballots cast. Wait, the requirement says "no.of votes" "no.of students" "no.of faculties". I will just count how many students voted and how many faculties voted.
                if (voter.role === 'student') studentsCount++;
                if (voter.role === 'faculty') facultiesCount++;
            }
        });

        const totalPoints = await Team.aggregate([
            { $match: { eventId } },
            { $group: { _id: null, total: { $sum: "$votes" } } }
        ]);

        const totalVotesCast = totalPoints.length > 0 ? totalPoints[0].total : 0; // if "no. of votes" means total vote points. Let's return both to be safe.

        // Fetch teams ranked by votes
        const teams = await Team.find({ eventId, votes: { $exists: true, $gt: 0 } }) // only teams with votes? Or all teams? Let's return all teams sorted by votes.
            .sort({ votes: -1 })
            .select('teamName votes')
            .lean();

        res.json({
            studentsVoted: studentsCount,
            facultiesVoted: facultiesCount,
            totalVotes: totalVotesCast,
            teams
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
