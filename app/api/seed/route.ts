
import { clerkClient } from "@clerk/nextjs";


import path from 'path';
import { promises as fs } from 'fs';

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@clerk/backend';
import { wait } from 'next/dist/lib/wait';

const seedEmployees = async () => {

  const pathFile = path.join(process.cwd(), 'app/api/seed/employee-seed.json');
  const data = await fs.readFile(pathFile, 'utf-8');
  const {
    employees,
  } = JSON.parse(data);


  for (const employee of employees) {
    employee.password = employee.password.toString()
    employee.skipPasswordChecks = true
    employee.phoneNumber = null
    const user: User = await clerkClient.users.createUser(employee)
    await wait(2000)
    const metaData = user.publicMetadata
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...metaData,
        phone_number: metaData.phone_number
      }
    })

  }



}


const deleteEmployees = async () => {

  const employees = await clerkClient.users.getUserList({limit: 500})

  console.log(employees.length)
  console.log(employees[0])

  for (const employee of employees) {
    await clerkClient.users.deleteUser(employee.id)
  }


}
export async function GET(req: NextRequest){
  const searchParams = req.nextUrl.searchParams
  const action = searchParams.get('action')
  if (action === "create") {
    await seedEmployees()
  } else if (action === "delete") {
    await deleteEmployees()
  }
  console.log("Done Seeding")
  return NextResponse.json({})
}



