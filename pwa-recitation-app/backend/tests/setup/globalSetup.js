const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const globalSetup = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.MONGO_URI = uri;
  global.__MONGOD__ = mongod;

  // Write the URI to a temp file
  const tempDir = path.join(__dirname, '..', '.tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  fs.writeFileSync(path.join(tempDir, 'mongoUri'), uri);
};

module.exports = globalSetup;
