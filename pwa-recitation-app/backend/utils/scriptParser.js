const parseScript = (text) => {
  const lines = text.split('\n');
  const structuredScript = [];
  let currentCharacter = null;
  let currentLine = '';

  const characterRegex = /^[A-Z\s]+:/; // Matches all caps, spaces, and a colon

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (characterRegex.test(trimmedLine)) {
      // If we have a pending line for the previous character, save it
      if (currentCharacter && currentLine) {
        structuredScript.push({
          character: currentCharacter,
          line: currentLine.trim(),
        });
      }
      // Start a new character's line
      currentCharacter = trimmedLine.slice(0, -1); // Remove the colon
      currentLine = '';
    } else if (currentCharacter && trimmedLine) {
      // Append to the current character's line
      currentLine += (currentLine ? ' ' : '') + trimmedLine;
    }
  }

  // Add the last line if it exists
  if (currentCharacter && currentLine) {
    structuredScript.push({
      character: currentCharacter,
      line: currentLine.trim(),
    });
  }

  return structuredScript;
};

module.exports = { parseScript };
