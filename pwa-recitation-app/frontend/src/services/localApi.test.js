import {
    createText,
    getTexts,
    getTextById,
    deleteText,
    analyzeText
} from './localApi';

describe('localApi', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should create a text', async () => {
        const newText = { title: 'Test Title', content: 'Test Content', type: 'individual' };
        const { data: createdText } = await createText(newText);
        expect(createdText.title).toBe('Test Title');
        expect(createdText._id).toBeDefined();

        const { data: texts } = await getTexts();
        expect(texts).toHaveLength(1);
        expect(texts[0].title).toBe('Test Title');
    });

    it('should get a text by id', async () => {
        const newText = { title: 'Test Title', content: 'Test Content', type: 'individual' };
        const { data: createdText } = await createText(newText);

        const { data: foundText } = await getTextById(createdText._id);
        expect(foundText.title).toBe('Test Title');
    });

    it('should delete a text', async () => {
        const newText = { title: 'Test Title', content: 'Test Content', type: 'individual' };
        const { data: createdText } = await createText(newText);

        let { data: texts } = await getTexts();
        expect(texts).toHaveLength(1);

        await deleteText(createdText._id);

        texts = (await getTexts()).data;
        expect(texts).toHaveLength(0);
    });

    it('should analyze a text and return a fidelity score', async () => {
        const newText = { title: 'Test Title', content: 'Hello world', type: 'individual' };
        const { data: createdText } = await createText(newText);

        const recitedText = 'Hello world';
        const { data: result } = await analyzeText(createdText._id, recitedText);
        expect(result.fidelityScore).toBe(100);

        const recitedText2 = 'Hello';
        const { data: result2 } = await analyzeText(createdText._id, recitedText2);
        expect(result2.fidelityScore).toBeLessThan(100);
    });

    it('should throw an error when analyzing a non-existent text', async () => {
        await expect(analyzeText('non-existent-id', 'some text')).rejects.toThrow('Text not found');
    });
});
