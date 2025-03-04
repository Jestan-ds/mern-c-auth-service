import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/login', () => {
  let connection: DataSource;
  //running this before all tests

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  //truncate the table after each test or database reset
  beforeEach(async () => {
    // await truncateTables(connection);
    await connection.dropDatabase();
    await connection.synchronize();
  });

  //close the connection after all tests
  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all the fields', () => {
    it('should return 200', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'xN0wZ@example.com',
        password: 'password',
      };
      const loginData = {
        email: 'xN0wZ@example.com',
        password: 'password',
      };
      //Act
      await request(app).post('/auth/register').send(userData);
      const response = await request(app).post('/auth/login').send(loginData);

      //assert

      //assert
      expect(response.statusCode).toBe(200);
    });
    it('should return access and refresh tokens in cookies', async () => {});
  });
});
