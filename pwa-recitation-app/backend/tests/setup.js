const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

process.env.JWT_SECRET = 'testsecret';

beforeAll(async () => {
  const mongoUri = fs.readFileSync(path.join(__dirname, '.tmp', 'mongoUri'), 'utf8');
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});
