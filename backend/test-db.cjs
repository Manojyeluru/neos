const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/technical_event')
  .then(async () => {
    const Voter = require('./models/Voter');
    const Team = require('./models/Team');
    const Event = require('./models/Event');

    const eventId = (await Event.findOne())._id;
    console.log('EventId:', eventId);

    const voters = await Voter.find({ eventId });
    console.log('Voters length:', voters.length);

    const totalPoints = await Team.aggregate([
      { $match: { eventId } },
      { $group: { _id: null, total: { $sum: "$votes" } } }
    ]);
    console.log('TotalPoints:', totalPoints);

    mongoose.disconnect();
  })
  .catch(e => {
    console.error('ERROR:', e.message);
    mongoose.disconnect();
  });
