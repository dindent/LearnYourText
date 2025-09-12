const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('User routes', () => {
    let token;

    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        token = res.body.token;
    });

    describe('GET /api/users', () => {
        it('should get all users for an authenticated user', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toHaveProperty('name', 'Test User');
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .get('/api/users');

            expect(res.statusCode).toEqual(401);
        });
    });
});
