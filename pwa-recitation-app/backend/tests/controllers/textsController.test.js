const { createText, getTextById, getTexts, deleteText, analyzeText, uploadPdf, parseTheatreScript, testParseScript } = require('../../controllers/textsController');
const Texte = require('../../models/Texte');
const Rapport = require('../../models/Rapport');
const { parseScript, getCharacterStats } = require('../../utils/scriptParser');
const diff_match_patch = require('diff-match-patch');

jest.mock('../../models/Texte');
jest.mock('../../models/Rapport');
jest.mock('../../utils/scriptParser');
jest.mock('diff-match-patch');
jest.mock('pdf-parse', () => jest.fn());
const pdf = require('pdf-parse');


describe('Texts Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: '123' },
      body: {
        title: 'Test Text',
        content: 'This is a test.',
        type: 'individual',
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      send: jest.fn(),
    };
    pdf.mockClear();
  });

  describe('createText', () => {
    it('should create a new individual text', async () => {
      const mockText = { _id: 'abc', ...req.body };
      const mockSave = jest.fn().mockResolvedValue(mockText);
      Texte.mockImplementation(() => ({
        save: mockSave,
      }));

      await createText(req, res);

      expect(Texte).toHaveBeenCalledWith({
        title: 'Test Text',
        content: 'This is a test.',
        user: '123',
        type: 'individual',
      });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockText);
    });

    it('should create a new theatre text and parse it', async () => {
      req.body.type = 'theatre';
      const parsedScript = [{ character: 'CHAR', line: 'line' }];
      parseScript.mockReturnValue(parsedScript);

      const mockText = { _id: 'abc', ...req.body, structure: parsedScript };
      const mockSave = jest.fn().mockResolvedValue(mockText);
      Texte.mockImplementation(() => ({
        save: mockSave,
      }));

      await createText(req, res);

      expect(parseScript).toHaveBeenCalledWith('This is a test.');
      expect(Texte).toHaveBeenCalledWith({
        title: 'Test Text',
        content: 'This is a test.',
        user: '123',
        type: 'theatre',
        structure: parsedScript,
      });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockText);
    });

    it('should handle server errors', async () => {
        Texte.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error('Server error')),
        }));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await createText(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Server Error');
        consoleSpy.mockRestore();
    });
  });

  describe('getTextById', () => {
    beforeEach(() => {
      req.params = { id: 'abc' };
    });

    it('should get a text by id', async () => {
      const mockText = { _id: 'abc', user: { toString: () => '123' } };
      Texte.findById.mockResolvedValue(mockText);

      await getTextById(req, res);

      expect(Texte.findById).toHaveBeenCalledWith('abc');
      expect(res.json).toHaveBeenCalledWith(mockText);
    });

    it('should return 404 if text not found', async () => {
      Texte.findById.mockResolvedValue(null);

      await getTextById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Text not found' });
    });

    it('should return 401 if user is not authorized', async () => {
      const mockText = { _id: 'abc', user: { toString: () => '456' } };
      Texte.findById.mockResolvedValue(mockText);

      await getTextById(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not authorized' });
    });

    it('should handle server errors', async () => {
        Texte.findById.mockRejectedValue(new Error('Server error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await getTextById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Server Error');
        consoleSpy.mockRestore();
    });
  });

  describe('getTexts', () => {
    it('should get all texts for a user', async () => {
      const texts = [{ title: 'Text 1' }, { title: 'Text 2' }];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(texts)
      };
      Texte.find.mockReturnValue(mockQuery);

      await getTexts(req, res);

      expect(Texte.find).toHaveBeenCalledWith({
        $or: [
            { user: '123' },
            { reviewers: '123' }
        ]
      });
      expect(mockQuery.populate).toHaveBeenCalledWith('user', 'name');
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(texts);
    });

    it('should handle server errors', async () => {
      Texte.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Server error'))
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await getTexts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
      consoleSpy.mockRestore();
    });
  });

  describe('deleteText', () => {
    beforeEach(() => {
      req.params = { id: 'abc' };
    });

    it('should delete a text', async () => {
      const mockText = { _id: 'abc', user: { toString: () => '123' } };
      Texte.findById.mockResolvedValue(mockText);
      Texte.findByIdAndDelete.mockResolvedValue(true);

      await deleteText(req, res);

      expect(Texte.findById).toHaveBeenCalledWith('abc');
      expect(Texte.findByIdAndDelete).toHaveBeenCalledWith('abc');
      expect(res.json).toHaveBeenCalledWith({ msg: 'Text removed' });
    });

    it('should return 404 if text not found', async () => {
      Texte.findById.mockResolvedValue(null);

      await deleteText(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Text not found' });
    });

    it('should return 401 if user is not authorized', async () => {
      const mockText = { _id: 'abc', user: { toString: () => '456' } };
      Texte.findById.mockResolvedValue(mockText);

      await deleteText(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not authorized' });
    });

    it('should handle server errors', async () => {
        Texte.findById.mockRejectedValue(new Error('Server error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await deleteText(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Server Error');
        consoleSpy.mockRestore();
    });
  });

  describe('analyzeText', () => {
    beforeEach(() => {
      req.params = { id: 'abc' };
      req.body.recitedText = 'This is a recited text.';

      const mockDmpInstance = {
        diff_main: jest.fn().mockReturnValue([]),
        diff_cleanupSemantic: jest.fn(),
        diff_levenshtein: jest.fn().mockReturnValue(5),
      };
      diff_match_patch.mockImplementation(() => mockDmpInstance);
    });

    it('should analyze a text and create a report', async () => {
      const mockText = { _id: 'abc', user: { toString: () => '123' }, content: 'This is a test.' };
      Texte.findById.mockResolvedValue(mockText);
      const mockReport = { _id: 'def', save: jest.fn().mockResolvedValue(true) };
      Rapport.mockImplementation(() => mockReport);

      await analyzeText(req, res);

      expect(Texte.findById).toHaveBeenCalledWith('abc');
      expect(Rapport).toHaveBeenCalled();
      expect(mockReport.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if text not found', async () => {
        Texte.findById.mockResolvedValue(null);
        await analyzeText(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Text not found' });
    });

    it('should return 401 if user is not authorized', async () => {
        const mockText = { _id: 'abc', user: { toString: () => '456' }, content: 'This is a test.' };
        Texte.findById.mockResolvedValue(mockText);
        await analyzeText(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: 'User not authorized' });
    });

    it('should handle server errors', async () => {
        Texte.findById.mockRejectedValue(new Error('Server error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await analyzeText(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Server Error');
        consoleSpy.mockRestore();
    });
  });

  describe('uploadPdf', () => {
    beforeEach(() => {
        req.file = {
            originalname: 'test.pdf',
            buffer: 'pdf buffer',
        };
    });

    it('should upload a pdf and create a text', async () => {
        const mockText = { _id: 'abc' };
        const mockSave = jest.fn().mockResolvedValue(mockText);
        Texte.mockImplementation(() => ({
            save: mockSave,
        }));
        pdf.mockResolvedValue({ text: 'pdf content' });

        await uploadPdf(req, res);

        expect(pdf).toHaveBeenCalledWith('pdf buffer');
        expect(Texte).toHaveBeenCalledWith({
            title: 'test',
            content: 'pdf content',
            user: '123',
            type: 'individual',
        });
        expect(mockSave).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockText);
    });

    it('should return 400 if no file is uploaded', async () => {
        req.file = null;
        await uploadPdf(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: 'No file uploaded.' });
    });

    it('should handle pdf parsing errors', async () => {
        pdf.mockRejectedValue(new Error('PDF parsing error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await uploadPdf(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error parsing PDF file.');
        consoleSpy.mockRestore();
    });
  });

  describe('parseTheatreScript', () => {
    beforeEach(() => {
        req.params = { id: 'abc' };
    });

    it('should parse a theatre script and update the text', async () => {
        const mockText = {
            _id: 'abc',
            user: { toString: () => '123' },
            content: 'script',
            save: jest.fn().mockResolvedValue(true)
        };
        Texte.findById.mockResolvedValue(mockText);
        parseScript.mockReturnValue([{ character: 'C', line: 'L' }]);
        getCharacterStats.mockReturnValue({ C: { lineCount: 1 } });

        await parseTheatreScript(req, res);

        expect(Texte.findById).toHaveBeenCalledWith('abc');
        expect(parseScript).toHaveBeenCalledWith('script');
        expect(mockText.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
    });
  });

  describe('testParseScript', () => {
    it('should parse a script from request body', async () => {
        req.body.content = 'script';
        parseScript.mockReturnValue([{ character: 'C', line: 'L' }]);
        getCharacterStats.mockReturnValue({ C: { lineCount: 1 } });

        await testParseScript(req, res);

        expect(parseScript).toHaveBeenCalledWith('script');
        expect(res.json).toHaveBeenCalled();
    });

    it('should return 400 if content is missing', async () => {
        req.body.content = '';
        await testParseScript(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Content is required' });
    });
  });
});
