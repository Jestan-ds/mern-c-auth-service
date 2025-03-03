import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';

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

  describe('Given all the fields', () => {});
});
