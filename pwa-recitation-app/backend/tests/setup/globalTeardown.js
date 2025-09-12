const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const globalTeardown = async () => {
  if (global.__MONGOD__) {
    await mongoose.disconnect();
    await global.__MONGOD__.stop();
  }

  // Clean up the temp file
  const tempFile = path.join(__dirname, '..', '.tmp', 'mongoUri');
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
};

module.exports = globalTeardown;
