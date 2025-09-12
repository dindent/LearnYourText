const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.post('/register', register);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post('/login', login);

// @route    POST api/auth/demo-token
// @desc     Generate demo token for testing (DEVELOPMENT ONLY)
// @access   Public
router.post('/demo-token', async (req, res) => {
  try {
    // Check if demo user exists
    let demoUser = await User.findOne({ email: 'demo@learnyourtext.com' });
    
    if (!demoUser) {
      // Create demo user
      demoUser = new User({
        name: 'Demo User',
        email: 'demo@learnyourtext.com',
        password: 'hashedpassword', // Not used for demo
      });
      await demoUser.save();
    }
    
    const payload = {
      user: {
        id: demoUser.id,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );
    
    res.json({ 
      token,
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
