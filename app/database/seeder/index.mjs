import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import {
  seedUsers,
  seedCountryCodes
} from './other-data-seed.mjs';

const prismaClient = new PrismaClient();

const seederRun = async () => {
  const pathFile = path.join(process.cwd(), 'app/database/seeder/seed-data/data-seed.json');
  const data = await fs.readFile(pathFile, 'utf-8');
  const {
      users,
    countryCodes
  } = JSON.parse(data);

  await Promise.all([
    seedUsers(users, prismaClient),
    seedCountryCodes(countryCodes, prismaClient),

  ]);
};

seederRun();
