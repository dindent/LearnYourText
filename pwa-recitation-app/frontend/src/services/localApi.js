import { v4 as uuidv4 } from 'uuid';
import diff_match_patch from 'diff-match-patch';
// Use ESM-compatible imports for pdfjs-dist v5
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
import { parseScript } from '../utils/scriptParser';

// Configure pdf.js worker to a locally served file from /public (copy step below)
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const getTextsFromStorage = () => {
    const texts = localStorage.getItem('texts');
    return texts ? JSON.parse(texts) : [];
};

const saveTextsToStorage = (texts) => {
    localStorage.setItem('texts', JSON.stringify(texts));
};

export const getTexts = async () => {
    const texts = getTextsFromStorage();
    return { data: texts };
};

export const getTextById = async (id) => {
    const texts = getTextsFromStorage();
    const text = texts.find((t) => t._id === id);
    return { data: text };
};

export const createText = async (textData) => {
    const texts = getTextsFromStorage();
    const newText = {
        ...textData,
        _id: uuidv4(),
        createdAt: new Date().toISOString(),
    };

    if (newText.type === 'theatre') {
        newText.structure = parseScript(newText.content);
    }

    const newTexts = [...texts, newText];
    saveTextsToStorage(newTexts);
    return { data: newText };
};

export const deleteText = async (id) => {
    const texts = getTextsFromStorage();
    const newTexts = texts.filter((t) => t._id !== id);
    saveTextsToStorage(newTexts);
    return { data: { msg: 'Text removed' } };
};

export const analyzeText = async (id, recitedText) => {
    const { data: originalText } = await getTextById(id);

    if (!originalText) {
        throw new Error('Text not found');
    }

    const dmp = new diff_match_patch();
    const diff = dmp.diff_main(originalText.content, recitedText);
    dmp.diff_cleanupSemantic(diff);

    const levenshteinDistance = dmp.diff_levenshtein(diff);
    const longerTextLength = Math.max(originalText.content.length, recitedText.length);
    const fidelityScore = ((longerTextLength - levenshteinDistance) / longerTextLength) * 100;

    return {
        data: {
            diff,
            fidelityScore: parseFloat(fidelityScore.toFixed(2)),
        }
    };
};

export const uploadPdf = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
            try {
                const pdf = await getDocument({ data: event.target.result }).promise;
                let content = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    content += textContent.items.map((s) => s.str).join(' ');
                }
                const newText = {
                    title: file.name.replace(/\.pdf$/i, ''),
                    content: content,
                    type: 'individual',
                };
                const createdText = await createText(newText);
                resolve({ data: createdText.data });
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};

export const parseTheatreScript = async (id) => {
    const texts = getTextsFromStorage();
    const textIndex = texts.findIndex((t) => t._id === id);
    if (textIndex === -1) {
        throw new Error('Text not found');
    }

    const text = texts[textIndex];
    const parsedScript = parseScript(text.content);

    texts[textIndex].structure = parsedScript;
    saveTextsToStorage(texts);

    return { data: { parsedScript } };
};

export const testParseScript = async (content) => {
    const parsedScript = parseScript(content);
    return { data: { parsedScript } };
};
