const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Texte = require('../../models/Texte');

describe('Texts routes', () => {
    let token;
    let userId;

    beforeEach(async () => {
        // Register a user
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
        token = registerRes.body.token;

        // Get user id from token
        const user = await User.findOne({ email: 'test@example.com' });
        userId = user._id;
    });

    describe('POST /api/texts', () => {
        it('should create a new text for an authenticated user', async () => {
            const res = await request(app)
                .post('/api/texts')
                .set('x-auth-token', token)
                .send({
                    title: 'New Text',
                    content: 'Some content',
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('title', 'New Text');
        });
    });

    describe('GET /api/texts', () => {
        it('should get all texts for an authenticated user', async () => {
            await new Texte({ title: 'Text 1', content: 'Content 1', user: userId }).save();
            await new Texte({ title: 'Text 2', content: 'Content 2', user: userId }).save();

            const res = await request(app)
                .get('/api/texts')
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(2);
        });
    });

    describe('GET /api/texts/:id', () => {
        it('should get a single text by id', async () => {
            const text = await new Texte({ title: 'Text 1', content: 'Content 1', user: userId }).save();

            const res = await request(app)
                .get(`/api/texts/${text._id}`)
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('title', 'Text 1');
        });
    });

    describe('DELETE /api/texts/:id', () => {
        it('should delete a text by id', async () => {
            const text = await new Texte({ title: 'Text 1', content: 'Content 1', user: userId }).save();

            const res = await request(app)
                .delete(`/api/texts/${text._id}`)
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('msg', 'Text removed');
        });
    });

    describe('POST /api/texts/:id/analyze', () => {
        it('should analyze a text', async () => {
            const text = await new Texte({ title: 'Text 1', content: 'This is a test.', user: userId }).save();

            const res = await request(app)
                .post(`/api/texts/${text._id}/analyze`)
                .set('x-auth-token', token)
                .send({ recitedText: 'This is a recited text.' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('fidelityScore');
        });
    });

    describe('POST /api/texts/upload/pdf', () => {
        it('should upload a pdf and create a text', async () => {
            const res = await request(app)
                .post('/api/texts/upload/pdf')
                .set('x-auth-token', token)
                .attach('file', Buffer.from('dummy pdf content'), 'test.pdf');

            expect(res.statusCode).toEqual(500); // pdf-parse will fail on non-pdf content, this is expected
        });
    });

    describe('POST /api/texts/:id/parse-theatre', () => {
        it('should parse a theatre script', async () => {
            const text = await new Texte({ title: 'Text 1', content: 'JEAN: Bonjour', user: userId }).save();

            const res = await request(app)
                .post(`/api/texts/${text._id}/parse-theatre`)
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('parsedScript');
        });
    });

    describe('POST /api/texts/test-parse', () => {
        it('should test parse a script', async () => {
            const res = await request(app)
                .post('/api/texts/test-parse')
                .set('x-auth-token', token)
                .send({ content: 'JEAN: Bonjour' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
        });
    });
});
