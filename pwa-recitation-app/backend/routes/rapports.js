const express = require('express');
const router = express.Router();
const Rapport = require('../models/Rapport');
const auth = require('../middleware/auth');

// @route    GET api/rapports
// @desc     Get all user's reports
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const rapports = await Rapport.find({ user: req.user.id })
      .populate('texte', 'title type')
      .sort({ createdAt: -1 });
    res.json(rapports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/rapports/:id
// @desc     Get a specific report by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const rapport = await Rapport.findById(req.params.id).populate('texte', 'title content type');
    if (!rapport) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    
    // Check if user owns the report
    if (rapport.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(rapport);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/rapports/text/:textId
// @desc     Get all reports for a specific text
// @access   Private
router.get('/text/:textId', auth, async (req, res) => {
  try {
    const rapports = await Rapport.find({ 
      user: req.user.id, 
      texte: req.params.textId 
    })
    .populate('texte', 'title type')
    .sort({ createdAt: -1 });
    res.json(rapports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;