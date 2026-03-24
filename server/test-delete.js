require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(async () => {
    const Event = require('./models/Event');
    const Team = require('./models/Team');
    const User = require('./models/User');
    const Round = require('./models/Round');
    const Criteria = require('./models/Criteria');
    const ProblemStatement = require('./models/ProblemStatement');

    try {
        const id = 'WAI3.0'; // Or another one 
        const event = await Event.findOneAndDelete({ eventId: id });
        if (!event) {
             console.log('Event not found for deletion. Id:', id);
             console.log('Existing events:', (await Event.find({}, 'eventId')).map(e => e.eventId));
             process.exit(0);
        }
        console.log('Found event Object ID:', event._id);
        
        await Team.deleteMany({ eventId: event._id });
        console.log('Teams deleted');
        
        await User.deleteMany({ eventId: event._id, role: { $ne: 'admin' } });
        console.log('Users deleted');
        
        await Round.deleteMany({ eventId: event._id });
        console.log('Rounds deleted');
        
        await Criteria.deleteMany({ eventId: event._id });
        console.log('Criteria deleted');
        
        await ProblemStatement.deleteMany({ eventId: event._id });
        console.log('Problems deleted');
        
        console.log('Event deleted successfully');
    } catch (e) {
        console.error('ERROR during deletion:', e);
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to connect:', err);
    process.exit(1);
  });
