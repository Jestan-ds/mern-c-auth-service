import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { truncateTables } from '../../tests/utills/index';

describe('POST /auth/register', () => {
  let connection: DataSource;
  //running this before all tests
  beforeAll(async () => {
    try {
      connection = await AppDataSource.initialize();
      console.log('Database connection initialized');
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
    }
  });
  //truncate the table after each test or database reset
  beforeEach(async () => {
    await truncateTables(connection);
  });

  //close the connection after all tests
  afterAll(async () => {
    await connection.destroy();
  });

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
      await request(app).post('/auth/register').send(userData);
      //assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
    });
  });

  describe('Fields are missing', () => {});
});
