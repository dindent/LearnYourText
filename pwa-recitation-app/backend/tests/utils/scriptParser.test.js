const {
  detectMethodColon,
  detectMethodAllCaps,
  detectMethodPrefix,
  detectMethodParentheses,
  parseScript,
  getCharacterStats,
} = require('../../utils/scriptParser');

describe('Script Parser', () => {
  describe('detectMethodColon', () => {
    it('should parse script with colon format', () => {
      const script = `
        JEAN: Bonjour!
        MARIE: Salut Jean.
      `;
      const expected = [
        { character: 'JEAN', line: 'Bonjour!' },
        { character: 'MARIE', line: 'Salut Jean.' },
      ];
      expect(detectMethodColon(script)).toEqual(expected);
    });

    it('should handle multiline dialogue', () => {
      const script = `
        JEAN: Bonjour!
        Comment ça va?
        MARIE: Salut Jean.
        Bien et toi?
      `;
      const expected = [
        { character: 'JEAN', line: 'Bonjour! Comment ça va?' },
        { character: 'MARIE', line: 'Salut Jean. Bien et toi?' },
      ];
      expect(detectMethodColon(script)).toEqual(expected);
    });
  });

  describe('detectMethodAllCaps', () => {
    it('should parse script with all caps format', () => {
      const script = `
        JEAN
        Bonjour!
        MARIE
        Salut Jean.
      `;
      const expected = [
        { character: 'JEAN', line: 'Bonjour!' },
        { character: 'MARIE', line: 'Salut Jean.' },
      ];
      expect(detectMethodAllCaps(script)).toEqual(expected);
    });
  });

  describe('detectMethodPrefix', () => {
    it('should parse script with prefix format', () => {
      const script = `
        JEAN - Bonjour!
        MARIE - Salut Jean.
      `;
      const expected = [
        { character: 'JEAN', line: 'Bonjour!' },
        { character: 'MARIE', line: 'Salut Jean.' },
      ];
      expect(detectMethodPrefix(script)).toEqual(expected);
    });
  });

  describe('detectMethodParentheses', () => {
    it('should parse script with parentheses format', () => {
      const script = `
        (JEAN) Bonjour!
        (MARIE) Salut Jean.
      `;
      const expected = [
        { character: 'JEAN', line: 'Bonjour!' },
        { character: 'MARIE', line: 'Salut Jean.' },
      ];
      expect(detectMethodParentheses(script)).toEqual(expected);
    });
  });

  describe('parseScript', () => {
    it('should choose the best method to parse the script', () => {
      const script = `
        JEAN: Bonjour!
        MARIE: Salut Jean.
      `;
      const expected = [
        { character: 'JEAN', line: 'Bonjour!' },
        { character: 'MARIE', line: 'Salut Jean.' },
      ];
      // The parseScript function calls console.log, so we need to mock it.
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      expect(parseScript(script)).toEqual(expected);
      consoleSpy.mockRestore();
    });
  });

  describe('getCharacterStats', () => {
    it('should return statistics about characters', () => {
      const parsedScript = [
        { character: 'JEAN', line: 'Bonjour!' },
        { character: 'MARIE', line: 'Salut Jean.' },
        { character: 'JEAN', line: 'Comment ça va?' },
      ];
      const expected = {
        JEAN: {
          lineCount: 2,
          wordCount: 4,
          averageLineLength: 2,
        },
        MARIE: {
          lineCount: 1,
          wordCount: 2,
          averageLineLength: 2,
        },
      };
      expect(getCharacterStats(parsedScript)).toEqual(expected);
    });
  });
});
