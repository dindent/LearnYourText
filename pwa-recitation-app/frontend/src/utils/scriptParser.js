/**
 * Enhanced script parser with multiple detection methods for character names
 * Supports various theatrical script formats
 */

/**
 * Detection Method 1: Standard format with colon (CHARACTER:)
 * Matches: "HAMLET:", "MARIE :", "JEAN-PIERRE:", etc.
 */
const detectMethodColon = (text) => {
  const lines = text.split('\n');
  const results = [];
  let currentCharacter = null;
  let currentDialogue = '';

  // More flexible regex for character names with colon
  const characterRegex = /^([A-ZÀ-ÿ][A-ZÀ-ÿ\s\-']*)\s*:\s*(.*)$/;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const match = trimmedLine.match(characterRegex);
    if (match) {
      // Save previous dialogue if exists
      if (currentCharacter && currentDialogue.trim()) {
        results.push({
          character: currentCharacter,
          line: currentDialogue.trim()
        });
      }
      
      currentCharacter = match[1].trim();
      currentDialogue = match[2] || '';
    } else if (currentCharacter) {
      // Continue dialogue on next lines
      currentDialogue += (currentDialogue ? ' ' : '') + trimmedLine;
    }
  }

  // Add final dialogue
  if (currentCharacter && currentDialogue.trim()) {
    results.push({
      character: currentCharacter,
      line: currentDialogue.trim()
    });
  }

  return results;
};

/**
 * Detection Method 2: Character names in ALL CAPS followed by dialogue
 * Matches lines starting with all caps names (without colon)
 */
const detectMethodAllCaps = (text) => {
  const lines = text.split('\n');
  const results = [];
  let currentCharacter = null;
  let currentDialogue = '';

  // Regex for all caps character names (min 2 chars, max 30)
  const characterRegex = /^([A-ZÀ-ÿ\s\-']{2,30})$/;
  const dialogueRegex = /[a-zà-ÿ]/; // A dialogue line should have at least one lowercase letter.

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    if (!trimmedLine) continue;

    // Check if this line is a character name
    if (characterRegex.test(trimmedLine) && 
        i < lines.length - 1 && 
        lines[i + 1].trim() && 
        dialogueRegex.test(lines[i + 1].trim())) {
      
      // Save previous dialogue
      if (currentCharacter && currentDialogue.trim()) {
        results.push({
          character: currentCharacter,
          line: currentDialogue.trim()
        });
      }
      
      currentCharacter = trimmedLine;
      currentDialogue = '';
    } else if (currentCharacter && !characterRegex.test(trimmedLine)) {
      // This is dialogue
      currentDialogue += (currentDialogue ? ' ' : '') + trimmedLine;
    }
  }

  // Add final dialogue
  if (currentCharacter && currentDialogue.trim()) {
    results.push({
      character: currentCharacter,
      line: currentDialogue.trim()
    });
  }

  return results;
};

/**
 * Detection Method 3: Prefixed character names (e.g., "PERSONNAGE - dialogue")
 */
const detectMethodPrefix = (text) => {
  const lines = text.split('\n');
  const results = [];

  // Regex for character with dash, hyphen, or other separators
  const characterRegex = /^([A-ZÀ-ÿ][A-ZÀ-ÿ\s\-']*?)\s*[-–—]\s*(.+)$/;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const match = trimmedLine.match(characterRegex);
    if (match) {
      results.push({
        character: match[1].trim(),
        line: match[2].trim()
      });
    }
  }

  return results;
};

/**
 * Detection Method 4: Parentheses format (PERSONNAGE) dialogue
 */
const detectMethodParentheses = (text) => {
  const lines = text.split('\n');
  const results = [];

  const characterRegex = /^\(([A-ZÀ-ÿ][A-ZÀ-ÿ\s\-']*?)\)\s*(.*)$/;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const match = trimmedLine.match(characterRegex);
    if (match && match[2]) {
      results.push({
        character: match[1].trim(),
        line: match[2].trim()
      });
    }
  }

  return results;
};

/**
 * Scoring function to evaluate the quality of detection results
 */
const scoreResults = (results, originalText) => {
  if (!results || results.length === 0) return 0;

  let score = 0;
  const characters = [...new Set(results.map(r => r.character))];
  const totalLines = results.length;

  // Base score: number of dialogue lines found
  score += totalLines * 10;

  // Bonus for having multiple characters (typical of plays)
  if (characters.length > 1) {
    score += characters.length * 20;
  }

  // Bonus for reasonable character name lengths
  const reasonableNames = characters.filter(char => 
    char.length >= 2 && char.length <= 25
  );
  score += reasonableNames.length * 15;

  // Penalty for very short dialogues (might be parsing errors)
  const shortDialogues = results.filter(r => r.line.length < 10);
  score -= shortDialogues.length * 5;

  // Bonus for consistent character appearances
  const characterCounts = {};
  results.forEach(r => {
    characterCounts[r.character] = (characterCounts[r.character] || 0) + 1;
  });
  
  const consistentCharacters = Object.values(characterCounts).filter(count => count > 1);
  score += consistentCharacters.length * 10;

  return Math.max(0, score);
};

/**
 * Main parsing function that tries multiple methods and returns the best result
 */
const parseScript = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const methods = [
    { name: 'colon', func: detectMethodColon },
    { name: 'allCaps', func: detectMethodAllCaps },
    { name: 'prefix', func: detectMethodPrefix },
    { name: 'parentheses', func: detectMethodParentheses }
  ];

  let bestResult = null;
  let bestScore = 0;
  let bestMethod = null;

  // Try each method and score the results
  for (const method of methods) {
    try {
      const result = method.func(text);
      const score = scoreResults(result, text);
      
      console.log(`Method ${method.name}: ${result.length} lines, score: ${score}`);
      
      if (score > bestScore) {
        bestScore = score;
        bestResult = result;
        bestMethod = method.name;
      }
    } catch (error) {
      console.error(`Error with method ${method.name}:`, error);
    }
  }

  // Post-process the best result
  if (bestResult && bestResult.length > 0) {
    bestResult = postProcessResults(bestResult);
    console.log(`Best method: ${bestMethod} (score: ${bestScore})`);
  }

  return bestResult || [];
};

/**
 * Post-processing to clean up and validate the results
 */
const postProcessResults = (results) => {
  return results
    .filter(result => 
      result.character && 
      result.character.trim().length > 0 &&
      result.line && 
      result.line.trim().length > 0
    )
    .map(result => ({
      character: cleanCharacterName(result.character),
      line: result.line.trim()
    }))
    .filter(result => 
      result.character.length >= 2 && 
      result.character.length <= 30 &&
      result.line.length > 0
    );
};

/**
 * Clean and standardize character names
 */
const cleanCharacterName = (name) => {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/[^\w\s\-'àâäéèêëîïôöùûüÿç]/gi, '') // Remove special chars except accents, hyphens, apostrophes
    .toUpperCase(); // Standardize to uppercase
};

/**
 * Get character statistics from parsed script
 */
const getCharacterStats = (parsedScript) => {
  const stats = {};
  
  parsedScript.forEach(line => {
    if (!stats[line.character]) {
      stats[line.character] = {
        lineCount: 0,
        wordCount: 0,
        averageLineLength: 0
      };
    }
    
    stats[line.character].lineCount++;
    stats[line.character].wordCount += line.line.split(/\s+/).length;
  });
  
  // Calculate averages
  Object.keys(stats).forEach(character => {
    stats[character].averageLineLength = 
      Math.round(stats[character].wordCount / stats[character].lineCount);
  });
  
  return stats;
};

export {
  parseScript,
  getCharacterStats,
  detectMethodColon,
  detectMethodAllCaps,
  detectMethodPrefix,
  detectMethodParentheses
};
