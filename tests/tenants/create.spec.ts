import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';

describe('POST /Tenants', () => {
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
    it('should return 201 status code', async () => {
      //Arrange
      const tenantData = {
        name: 'Tenant name',
        address: '123 Test St',
      };
      const response = await request(app).post('/tenants').send(tenantData);

      //Assert
      expect(response.statusCode).toBe(201);
    });
    it('should create a tenant in the database', async () => {
      //Arrange
      const tenantData = {
        name: 'Tenant name',
        address: '123 Test St',
      };
      await request(app).post('/tenants').send(tenantData);

      const tenantRepository = connection.getRepository('Tenant');
      const tenants = await tenantRepository.find();
      //Assert
      expect(tenants[0]).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
    });
  });
});
