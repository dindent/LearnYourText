const authMiddleware = require('../../middleware/auth');
const jwt = require('jsonwebtoken');

describe('Auth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next() if token is valid', () => {
    const token = jwt.sign({ user: { id: '123' } }, 'test_secret');
    req.header.mockReturnValue(token);
    process.env.JWT_SECRET = 'test_secret';

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('123');
  });

  it('should return 401 if no token is provided', () => {
    req.header.mockReturnValue(null);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.header.mockReturnValue('invalid_token');
    process.env.JWT_SECRET = 'test_secret';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
});
