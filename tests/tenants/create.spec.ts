import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';

describe('POST /Tenants', () => {
  let connection: DataSource;
  //running this before all tests
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    //initialize the mock JWKS server
    jwks = createJWKSMock('http://localhost:5501');
    connection = await AppDataSource.initialize();
  });

  //truncate the table after each test or database reset
  beforeEach(async () => {
    //start the JWKS server
    jwks.start();
    // await truncateTables(connection);
    await connection.dropDatabase();
    await connection.synchronize();

    adminToken = jwks.token({
      sub: '1',
      role: Roles.ADMIN,
    });
  });
  //stop the JWKS server after each test
  afterEach(() => {
    jwks.stop();
  });

  //close the connection after all tests
  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all the fields', () => {
    it('should return 201 status code', async () => {
      //Arrange
      const tenantData = {
        name: 'Tenant name',
        address: '123 Test St',
      };
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      //Assert
      expect(response.statusCode).toBe(201);
    });

    it('should create a tenant in the database', async () => {
      //Arrange
      const tenantData = {
        name: 'Tenant name',
        address: '123 Test St',
      };
      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository('Tenant');
      const tenants = await tenantRepository.find();
      //Assert
      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
    });

    it('should return 401 if user is not authenticated', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: '123 Test St',
      };
      const response = await request(app).post('/tenants').send(tenantData);

      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository('Tenant');
      const tenants = await tenantRepository.find();
      //Assert
      expect(tenants).toHaveLength(0);
    });
  });
});
