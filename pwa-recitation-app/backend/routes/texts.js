const express = require('express');
const router = express.Router();
const {
  createText,
  getTexts,
  getTextById,
  analyzeText,
  uploadPdf,
  deleteText,
  parseTheatreScript,
  testParseScript,
} = require('../controllers/textsController');
const multer = require('multer');
const auth = require('../middleware/auth');

// Multer config for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// @route    POST api/texts
// @desc     Create a text
// @access   Private
router.post('/', auth, createText);

// @route    GET api/texts
// @desc     Get all user's texts
// @access   Private
router.get('/', auth, getTexts);

// @route    GET api/texts/:id
// @desc     Get a text by ID
// @access   Private
router.get('/:id', auth, getTextById);

// @route    POST api/texts/:id/analyze
// @desc     Analyze a recitation
// @access   Private
router.post('/:id/analyze', auth, analyzeText);

// @route    POST api/texts/upload/pdf
// @desc     Upload PDF for text extraction
// @access   Private
router.post('/upload/pdf', auth, upload.single('pdfFile'), uploadPdf);

// @route    DELETE api/texts/:id
// @desc     Delete a text by ID
// @access   Private
router.delete('/:id', auth, deleteText);

// @route    POST api/texts/test-parse
// @desc     Test theatre script parsing without saving
// @access   Private
router.post('/test-parse', auth, testParseScript);

// @route    POST api/texts/:id/parse-theatre
// @desc     Parse and analyze a theatre script
// @access   Private
router.post('/:id/parse-theatre', auth, parseTheatreScript);

module.exports = router;
