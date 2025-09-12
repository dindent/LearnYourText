const Texte = require('../models/Texte');
const Rapport = require('../models/Rapport');
const diff_match_patch = require('diff-match-patch');
const { parseScript, getCharacterStats } = require('../utils/scriptParser');

// @desc    Create a new text
// @route   POST /api/texts
// @access  Private (for now, we assume a user is logged in)
exports.createText = async (req, res) => {
  try {
    const { title, content, type } = req.body;

    const textData = {
      title,
      content,
      user: req.user.id,
      type: type || 'individual',
    };

    if (type === 'theatre') {
      textData.structure = parseScript(content);
    }

    const newText = new Texte(textData);
    const text = await newText.save();
    res.status(201).json(text);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single text by ID
// @route   GET /api/texts/:id
// @access  Private
exports.getTextById = async (req, res) => {
    try {
        const text = await Texte.findById(req.params.id);
        if (!text) {
            return res.status(404).json({ msg: 'Text not found' });
        }
        
        // Check if user owns the text
        if (text.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        res.json(text);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Upload a PDF and extract text
// @route   POST /api/texts/upload/pdf
// @access  Private
const pdf = require('pdf-parse');

exports.uploadPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }

        const data = await pdf(req.file.buffer);

        // The extracted text is in data.text
        // We can now create a new text entry with it.
        // The title could be the filename, for example.
        const newText = new Texte({
            title: req.file.originalname.replace(/\.pdf$/i, ''), // Use filename as title
            content: data.text,
            user: req.user.id,
            type: 'individual', // Or could be passed in form-data
        });

        const text = await newText.save();
        res.status(201).json(text);

    } catch (err) {
        console.error('PDF parsing error:', err);
        res.status(500).send('Error parsing PDF file.');
    }
};

// @desc    Get all texts for a user
// @route   GET /api/texts
// @access  Private
exports.getTexts = async (req, res) => {
    try {
        const texts = await Texte.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(texts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Analyze a recitation attempt
// @route   POST /api/texts/:id/analyze
// @access  Private
exports.analyzeText = async (req, res) => {
    try {
        const originalText = await Texte.findById(req.params.id);
        if (!originalText) {
            return res.status(404).json({ msg: 'Text not found' });
        }

        // Check if user owns the text
        if (originalText.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const { recitedText } = req.body;

        // 1. Initialize the diff-match-patch library
        const dmp = new diff_match_patch();

        // 2. Compute the difference
        const diff = dmp.diff_main(originalText.content, recitedText);

        // 3. Optional: clean up the diff for better readability
        dmp.diff_cleanupSemantic(diff);

        // 4. Calculate fidelity score
        const levenshteinDistance = dmp.diff_levenshtein(diff);
        const longerTextLength = Math.max(originalText.content.length, recitedText.length);
        const fidelityScore = ((longerTextLength - levenshteinDistance) / longerTextLength) * 100;

        // 5. Save the report to the database
        const report = new Rapport({
            user: req.user.id,
            texte: req.params.id,
            recitedText: recitedText,
            diff: diff,
            fidelityScore: parseFloat(fidelityScore.toFixed(2)),
        });
        await report.save();

        res.json({
            diff,
            fidelityScore: parseFloat(fidelityScore.toFixed(2)),
            reportId: report._id,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a text by ID
// @route   DELETE /api/texts/:id
// @access  Private
exports.deleteText = async (req, res) => {
    try {
        const text = await Texte.findById(req.params.id);
        if (!text) {
            return res.status(404).json({ msg: 'Text not found' });
        }

        // Check if user owns the text
        if (text.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Texte.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Text removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Parse and analyze a theatre script
// @route   POST /api/texts/:id/parse-theatre
// @access  Private
exports.parseTheatreScript = async (req, res) => {
    try {
        const text = await Texte.findById(req.params.id);
        if (!text) {
            return res.status(404).json({ msg: 'Text not found' });
        }

        // Check if user owns the text
        if (text.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Parse the script with the enhanced parser
        const parsedScript = parseScript(text.content);
        const characterStats = getCharacterStats(parsedScript);

        // Update the text with the new structure
        text.structure = parsedScript;
        text.type = 'theatre';
        await text.save();

        res.json({
            parsedScript,
            characterStats,
            characterCount: Object.keys(characterStats).length,
            totalLines: parsedScript.length
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Test theatre script parsing without saving
// @route   POST /api/texts/test-parse
// @access  Private
exports.testParseScript = async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ msg: 'Content is required' });
        }

        // Parse the script with the enhanced parser
        const parsedScript = parseScript(content);
        const characterStats = getCharacterStats(parsedScript);

        res.json({
            success: true,
            parsedScript,
            characterStats,
            characterCount: Object.keys(characterStats).length,
            totalLines: parsedScript.length,
            preview: parsedScript.slice(0, 10) // First 10 lines for preview
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false, 
            error: 'Parsing failed',
            details: err.message 
        });
    }
};
