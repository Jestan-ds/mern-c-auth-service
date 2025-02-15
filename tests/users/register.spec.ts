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

    it('should persist the user in the database', async () => {
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
      expect(respose.body).toHaveProperty('id');
      expect(respose.body).toHaveProperty('firstName');
      expect(respose.body).toHaveProperty('lastName');
      expect(respose.body).toHaveProperty('email');
      expect(respose.body).toHaveProperty('createdAt');
      expect(respose.body).toHaveProperty('updatedAt');
    });
  });

  describe('Fields are missing', () => {});
});
