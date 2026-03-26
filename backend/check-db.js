const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection;
        const users = db.collection('users');
        const teams = db.collection('teams');
        const uIdx = await users.indexes();
        const tIdx = await teams.indexes();
        console.log('Users indexes:', JSON.stringify(uIdx, null, 2));
        console.log('Teams indexes:', JSON.stringify(tIdx, null, 2));
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
};

run();
