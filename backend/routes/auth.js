const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const EventSettings = require('../models/EventSettings');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

// --- FIREBASE ADMIN (Google Auth Verification) ---
const admin = require('firebase-admin');
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'tech-8d6ab',
    });
}

// --- PUBLIC EVENTS ---
router.get('/public-events', async (req, res) => {
    try {
        const Event = require('../models/Event');
        const events = await Event.find({}).select('_id name');
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- GOOGLE LOGIN ---
router.post('/google-login', async (req, res) => {
    const { idToken, role } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'Missing Firebase ID token.' });
    }

    try {
        // 1. Verify the Firebase ID token using firebase-admin
        const decoded = await admin.auth().verifyIdToken(idToken);
        const { email, name: googleName, uid } = decoded;

        if (!email) {
            return res.status(400).json({ message: 'No email associated with this Google account.' });
        }

        // 2. Look up the user in our DB by email
        let user = await User.findOne({ email });

        if (!user) {
            // Google user not registered in the system yet
            return res.status(404).json({
                message: `No account found for ${email}. Please register first or ask the administrator to add your account.`
            });
        }

        // 3. Optional role check — warn if the role doesn't match but still allow
        //    (Admin can have multiple roles, so we soft-check here)
        if (role && user.role !== role) {
            // Allow admin to log in from any portal, block everyone else
            if (user.role !== 'admin' && user.role !== 'coordinator') {
                return res.status(403).json({
                    message: `Access denied. Your account role is '${user.role}', not '${role}'.`
                });
            }
        }

        // 4. Issue a JWT the same way the normal login does
        const token = jwt.sign(
            { id: user._id, role: user.role, uniqueId: user.uniqueId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                uniqueId: user.uniqueId,
                name: user.name,
            },
        });
    } catch (err) {
        console.error('Google login error:', err);
        if (err.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Google session expired. Please sign in again.' });
        }
        if (err.code && err.code.startsWith('auth/')) {
            return res.status(401).json({ message: 'Invalid Google token. Please try again.' });
        }
        res.status(500).json({ message: err.message });
    }
});

// --- PUBLIC SETTINGS ---
const Event = require('../models/Event');

router.get('/event-settings', async (req, res) => {
    try {
        const { eventId } = req.query;
        let event;
        if (eventId) {
            event = await Event.findOne({ eventId });
        } else {
            // Default to latest open event if no ID provided
            event = await Event.findOne({ 'settings.eventStatus': 'Open' }).sort({ createdAt: -1 });
        }

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({
            ...event.settings,
            name: event.name,
            description: event.description,
            venue: event.venue,
            clubLogo: event.clubLogo,
            eventPoster: event.eventPoster,
            _id: event._id,
            eventId: event.eventId
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- PUBLIC EVENTS LIST (for event selection on landing page) ---
router.get('/public-events', async (req, res) => {
    try {
        const events = await Event.find({ 'settings.eventStatus': 'Open' })
            .select('eventId name description venue startDate endDate settings clubLogo eventPoster')
            .sort({ createdAt: -1 })
            .lean();
        res.json(events);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// --- TEAM LEADER REGISTRATION ---
router.post('/register/team-leader', async (req, res) => {
    const {
        teamName, phone,
        name, email, password, year, department,
        collegeType, residenceType, hostelNumber, collegeName, regNo,
        paymentReference, members, eventId // eventId is the string ID like 'hackathon-2026'
    } = req.body;

    try {
        const event = await Event.findOne({ eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const settings = event.settings;
        if (settings.eventStatus !== 'Open') {
            return res.status(403).json({ message: 'Registration is currently closed' });
        }

        // Validate member count
        const totalMembers = (members?.length || 0) + 1; // +1 for the leader

        if (settings.registrationType === 'Single') {
            if (totalMembers > 1) {
                return res.status(400).json({ message: 'Single registration allows only 1 participant.' });
            }
        } else {
            if (totalMembers < settings.minMembers || totalMembers > settings.maxMembers) {
                return res.status(400).json({
                    message: `Team size must be between ${settings.minMembers} and ${settings.maxMembers}`
                });
            }

            // Validate max limit for teams
            const currentTeamsCount = await Team.countDocuments({ eventId: event._id });
            if (settings.maxTeams && currentTeamsCount >= settings.maxTeams) {
                return res.status(400).json({ message: 'Event has reached the maximum number of teams allowed.' });
            }
        }

        const allCurrentTeams = await Team.find({ eventId: event._id }, 'members');
        const currentParticipantsCount = allCurrentTeams.reduce((acc, team) => acc + (team.members?.length || 0), 0);
        
        if (settings.maxParticipants && (currentParticipantsCount + totalMembers) > settings.maxParticipants) {
            return res.status(400).json({ message: `Event has reached the maximum number of participants allowed. Only ${Math.max(0, settings.maxParticipants - currentParticipantsCount)} slots remaining.` });
        }

        // Validation - ensure email is unique WITHIN THE EVENT
        const allEmails = [email];
        if (members && members.length > 0) {
            members.forEach(m => {
                if (m.email) allEmails.push(m.email);
            });
        }

        // Temporarily bypass validations to "accept like thi details"
        // let existingUser = await User.findOne({
        //     $and: [
        //         { email: { $in: allEmails } },
        //         { eventId: event._id }
        //     ]
        // });

        // let existingTeamMember = await Team.findOne({
        //     eventId: event._id,
        //     'members.email': { $in: allEmails }
        // });

        // if (existingUser || existingTeamMember) return res.status(400).json({ message: 'You are already registered for this event' });

        // Generate unique Team ID
        const uniqueId = `TEAM-${Math.floor(100000 + Math.random() * 900000)}`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser = new User({
            username: `${eventId}_${email}_${Date.now()}`, // Append timestamp to avoid username duplicate constraint
            email,
            password: hashedPassword,
            role: 'teamleader',
            uniqueId,
            name,
            regNo,
            phone,
            year,
            department,
            collegeType,
            residenceType: collegeType === 'KARE' ? residenceType : undefined,
            hostelNumber: (collegeType === 'KARE' && residenceType === 'Hostler') ? hostelNumber : undefined,
            collegeName: collegeType === 'Other' ? collegeName : 'KARE',
            eventId: event._id
        });

        try {
            await newUser.save();
        } catch (err) {
            if (err.code === 11000) {
                // If email/ID is already in use, find the existing user and reuse them as leader
                const existingUser = await User.findOne({ email });
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
            teamName: teamName || `${name}'s Team`,
            leaderId: newUser._id,
            eventId: event._id,
            members: [
                {
                    name, email, regNo, phone, year, department, collegeType, collegeName,
                    residenceType: collegeType === 'KARE' ? residenceType : undefined,
                    hostelNumber: (collegeType === 'KARE' && residenceType === 'Hostler') ? hostelNumber : undefined
                },
                ...(members || [])
            ],
            paymentStatus: settings.isPaidEvent ? 'Pending' : 'Free',
            paymentReference: paymentReference || undefined
        });

        await newTeam.save();

        try {
            const emailPromises = newTeam.members.map(member => {
                if (member.email) {
                    const faceScanLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/face-register?teamId=${uniqueId}&email=${encodeURIComponent(member.email)}`;
                    
                    let whatsappSection = '';
                    if (settings.whatsappLink) {
                        whatsappSection = `
                        <br/><br/>
                        <p><b>STAY UPDATED:</b> Please join our official WhatsApp group for all important announcements and updates.</p>
                        <a href="${settings.whatsappLink}" style="padding: 10px 20px; background-color: #25D366; color: white; border-radius: 5px; text-decoration: none; display: inline-block;">Join WhatsApp Group</a>`;
                    }

                    return sendEmail(
                        member.email,
                        `Registration Successful - ${event.name}`,
                        `<h1>Welcome, ${member.name}!</h1>
                        <p>You have successfully registered for <b>${event.name}</b>. Your unique Team ID is <b>${uniqueId}</b>, and your team name is <b>${newTeam.teamName}</b>.</p>
                        <br/>
                        <p><b>MANDATORY:</b> Please register your Face ID to ensure your attendance is detected successfully during the event phase.</p>
                        <a href="${faceScanLink}" style="padding: 10px 20px; background-color: #3b82f6; color: white; border-radius: 5px; text-decoration: none; display: inline-block;">Complete Face ID Scan</a>
                        <br/><br/><p>If the button doesn't work, copy and paste this link in your browser: <br/>${faceScanLink}</p>
                        ${whatsappSection}`
                    );
                }
                return Promise.resolve();
            });
            
            // Fire and forget emails but log any critical errors
            Promise.all(emailPromises)
                .then(() => {
                    console.log(`All registration emails queued for ${newTeam.members.length} members of team ${uniqueId}`);
                })
                .catch(mailErr => {
                    console.error('Background Mail Error for team', uniqueId, ':', mailErr.message || mailErr);
                    // Still allow registration to succeed even if emails fail
                });
        } catch (mailErr) {
            console.error('Mail Setup Error:', mailErr.message || mailErr);
            // Still allow registration to succeed even if email setup fails
        }

        res.status(201).json({
            message: 'Registration successful',
            uniqueId,
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email or ID already in use: ' + err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

// --- CHECK REGISTRATION STATUS ---
router.post('/check-status', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const team = await Team.findOne({ 'members.email': email })
            .populate('eventId', 'name')
            .lean();

        if (!team) {
            return res.status(404).json({ message: 'No registration found for this email address.' });
        }

        res.json({
            teamName: team.teamName,
            teamId: team.teamId,
            status: team.status || 'Pending',
            paymentStatus: team.paymentStatus || 'Free',
            eventName: team.eventId?.name || 'Symposium Event',
            members: team.members.map(m => ({ name: m.name, email: m.email, regNo: m.regNo }))
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
    const { email, username, password } = req.body;
    const identifier = email || username;

    try {
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }, { uniqueId: identifier }]
        });
        if (!user) return res.status(404).json({ message: 'Invalid credentials' });

        // Google-only accounts have no password — direct them to use Google Sign-In
        if (!user.password) {
            return res.status(400).json({ message: 'This account uses Google Sign-In. Please use the "Continue with Google" button.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, role: user.role, uniqueId: user.uniqueId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                uniqueId: user.uniqueId,
                name: user.name
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- MAGIC LOGIN ---
router.post('/magic-login', async (req, res) => {
    const { token: magicToken } = req.body;
    try {
        const user = await User.findOne({
            magicToken,
            magicTokenExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired access link' });

        // Clear token after login
        user.magicToken = undefined;
        user.magicTokenExpiry = undefined;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role, uniqueId: user.uniqueId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                uniqueId: user.uniqueId,
                name: user.name
            }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- REVIEWER ID + EMAIL LOGIN ---
router.post('/reviewer-login', async (req, res) => {
    const { email, uniqueId } = req.body;
    try {
        const user = await User.findOne({ email, uniqueId, role: 'reviewer' });
        if (!user) return res.status(404).json({ message: 'Invalid credentials or access denied' });

        const token = jwt.sign(
            { id: user._id, role: user.role, uniqueId: user.uniqueId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                uniqueId: user.uniqueId,
                name: user.name
            }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        // Send Email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        await sendEmail(
            email,
            'Password Reset Request',
            `<p>You requested a password reset. Please click the link below to reset your password. This link expires in 15 minutes.</p><a href="${resetUrl}">${resetUrl}</a>`
        );

        res.json({ message: 'Reset email sent' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- RESET PASSWORD ---
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- TEST EMAIL (Debug endpoint) ---
router.post('/test-email', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email address required' });
    }

    try {
        console.log('🧪 Testing email service with:', email);
        
        await sendEmail(
            email,
            'Test Email - Registration System',
            `<h1>Test Email</h1>
            <p>If you received this email, the email service is working correctly!</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <br/>
            <p style="color: green; font-weight: bold;">✅ Email service is operational</p>`
        );
        
        res.json({ 
            message: 'Test email sent successfully',
            email,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('🧪 Email test failed:', err.message);
        res.status(500).json({ 
            message: 'Failed to send test email',
            error: err.message,
            hint: 'Check that EMAIL_USER and EMAIL_PASS are correctly set in .env file'
        });
    }
});

module.exports = router;
