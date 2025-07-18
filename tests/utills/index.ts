import { error } from 'console';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../../src/entity/Tenant';

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear();
  }
};

export const isjwt = (token: string | null): boolean => {
  if (token === null) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    parts.forEach((part) => {
      Buffer.from(part, 'base64').toString('utf-8');
    });

    return true;
  } catch (e) {
    error(e);
    return false;
  }
};

export const createTenant = async (repository: Repository<Tenant>) => {
  const tenant = repository.save({
    name: 'Test Tenant',
    address: 'test address',
  });
  return tenant;
};
