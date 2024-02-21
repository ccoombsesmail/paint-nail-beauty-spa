import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import {
  seedCustomers,
  seedCountryCodes
} from './other-data-seed.mjs';

const prismaClient = new PrismaClient();

const seederRun = async () => {
  const pathFile = path.join(process.cwd(), 'app/database/seeder/seed-data/data-seed.json');
  const data = await fs.readFile(pathFile, 'utf-8');
  const {
      customers,
    countryCodes
  } = JSON.parse(data);

  await Promise.all([
    // seedCustomers(customers, prismaClient),
    seedCountryCodes(countryCodes, prismaClient),

  ]);
};

seederRun();
