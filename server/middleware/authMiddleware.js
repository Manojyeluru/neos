const jwt = require('jsonwebtoken');

const authMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No entrance permit provided. Access denied.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = decoded;

            // Admin bypasses all checks
            if (req.user.role === 'admin') {
                return next();
            }

            if (allowedRoles && !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ message: 'You do not have the clearance for this sector.' });
            }

            next();
        } catch (err) {
            res.status(401).json({ message: 'Invalid or expired clearance token.' });
        }
    };
};

module.exports = authMiddleware;
