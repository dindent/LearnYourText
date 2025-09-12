const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Texte = require('../../models/Texte');
const Rapport = require('../../models/Rapport');

describe('Rapports routes', () => {
    let token;
    let userId;
    let textId;

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

        const user = await User.findOne({ email: 'test@example.com' });
        userId = user._id;

        const text = await new Texte({ title: 'Test Text', content: 'Some content', user: userId }).save();
        textId = text._id;

        await new Rapport({
            user: userId,
            texte: textId,
            fidelityScore: 95,
            recitedText: 'Some recited text',
            diff: []
        }).save();
    });

    describe('GET /api/rapports', () => {
        it('should get all rapports for a user', async () => {
            const res = await request(app)
                .get('/api/rapports')
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
        });
    });

    describe('GET /api/rapports/:id', () => {
        it('should get a rapport by id', async () => {
            const rapport = await Rapport.findOne({ user: userId });
            const res = await request(app)
                .get(`/api/rapports/${rapport._id}`)
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('fidelityScore', 95);
        });
    });

    describe('GET /api/rapports/text/:textId', () => {
        it('should get all rapports for a specific text', async () => {
            const res = await request(app)
                .get(`/api/rapports/text/${textId}`)
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
        });
    });
});
