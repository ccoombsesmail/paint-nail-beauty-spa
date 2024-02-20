import { clerkClient } from "@clerk/nextjs";
import path from 'path';
import { promises as fs } from 'fs';

// type PasswordHasher = 'argon2i' | 'argon2id' | 'bcrypt' | 'md5' | 'pbkdf2_sha256' | 'pbkdf2_sha256_django' | 'pbkdf2_sha1' | 'scrypt_firebase';
// type UserPasswordHashingParams = {
//   passwordDigest: string;
//   passwordHasher: PasswordHasher;
// };
//
// type CreateUserParams = {
//   externalId?: string;
//   emailAddress?: string[];
//   phoneNumber?: string[];
//   username?: string;
//   password?: string;
//   firstName?: string;
//   lastName?: string;
//   skipPasswordChecks?: boolean;
//   skipPasswordRequirement?: boolean;
//   totpSecret?: string;
//   backupCodes?: string[];
//   createdAt?: Date;
// } & UserMetadataParams & (UserPasswordHashingParams | object);
//
// type UserMetadataParams = {
//   publicMetadata?: UserPublicMetadata;
//   privateMetadata?: UserPrivateMetadata;
//   unsafeMetadata?: UserUnsafeMetadata;
// };
const seedEmployees = async () => {

  const pathFile = path.join(process.cwd(), 'app/database/seeder/seed-data/employee-seed.json');
  const data = await fs.readFile(pathFile, 'utf-8');
  const {
    employees,
  } = JSON.parse(data);


  for (const employee of employees) {
    await clerkClient.users.createUser(employee)
  }



}

seedEmployees().then(() => console.log("Finished Seeding Users")).catch(err => console.log(err))
