const { getUsers } = require('../../controllers/userController');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
      send: jest.fn(),
    };
  });

  describe('getUsers', () => {
    it('should get all users', async () => {
      const users = [{ name: 'User 1' }, { name: 'User 2' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(users) };
      User.find.mockReturnValue(mockQuery);

      await getUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('should return 500 on server error', async () => {
      User.find.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('Server error')) });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
      consoleSpy.mockRestore();
    });
  });
});
