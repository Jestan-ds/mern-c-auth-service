import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
  describe('Given all the fields', () => {
    it('should return 201', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'xN0wZ@example.com',
        password: 'password',
      };
      //Act
      const respose = await request(app).post('/auth/register').send(userData);
      //assert
      expect(respose.statusCode).toBe(201);
    });

    it('should return valid json response', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'xN0wZ@example.com',
        password: 'password',
      };
      //Act
      const respose = await request(app).post('/auth/register').send(userData);
      //assert
      expect(respose.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      );
    });
  });

  describe('Fields are missing', () => {});
});
