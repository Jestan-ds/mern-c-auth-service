import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('POST /auth/register', () => {
  let connection: DataSource;
  //running this before all tests

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  //truncate the table after each test or database reset
  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
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
      expect(users[0].email).toBe(userData.email);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
    });

    it('should return the id of created user', async () => {
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
      expect(respose.body).toHaveProperty('id');

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].id).toBe((respose.body as Record<string, string>).id);
    });

    it('should assign a customer role to the user by default', async () => {
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
      expect(users[0]).toHaveProperty('role');
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it('should store the hashed password in the database', async () => {
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
      expect(users[0]).toHaveProperty('password');
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    it('should return 400 if email is already in use', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'xN0wZ@example.com',
        password: 'password',
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });
      //Act
      const respose = await request(app).post('/auth/register').send(userData);

      const users = await userRepository.find();
      //assert
      expect(respose.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });

  describe('Fields are missing', () => {});
});
