import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { createTenant } from '../utills';
import { Tenant } from '../../src/entity/Tenant';

describe('POST /users', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all the fields', () => {
    it('should persist the user in the database', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });
      //Register a user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'xN0wZ@example.com',
        password: 'password',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      //add token to cookie
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      //assert

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
      expect(users[0].email).toBe(userData.email);
    });

    it('should create a manager user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });
      //Register a user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'xN0wZ@example.com',
        password: 'password',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      //add token to cookie
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);
      //assert

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0].role).toBe(Roles.MANAGER);
    });

    it.todo('should return 403 if non admin user tries to create a user');
  });
});
