const mongoose = require('mongoose');

describe('Test setup', () => {
  it('should connect to the database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
