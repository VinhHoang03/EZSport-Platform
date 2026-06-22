const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://vinhhoangdev:03072005@cluster0-hoangvinh.msq1gzg.mongodb.net/EZSport?retryWrites=true&w=majority';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).sort({ createdAt: -1 }).limit(5).toArray();
  console.log('Latest 5 users:', JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
