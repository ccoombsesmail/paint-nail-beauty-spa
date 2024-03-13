
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
    try {
      employee.password = employee.password.toString()
      employee.skipPasswordChecks = true
      // employee.phoneNumber = ''
      const user: User = await clerkClient.users.createUser(employee)
      await wait(2000)
      const metaData = user.publicMetadata
      await clerkClient.users.updateUser(user.id, {
        publicMetadata: {
          ...metaData,
          phone_number: metaData.phone_number
        }
      })
    } catch (e) {
      console.log(employee)
      console.log(e)
    }

  }



}


const deleteEmployees = async () => {

  const employees = await clerkClient.users.getUserList({limit: 500})


  for (const employee of employees) {
    await clerkClient.users.deleteUser(employee.id)
  }


}
export async function GET(req: NextRequest){

  const searchParams = req.nextUrl.searchParams
  const action = searchParams.get('action')
  const pw = searchParams.get('pw')
  if (pw !== 'seedme') {
    return NextResponse.json({success: false, error: "Wrong Password"})
  }
  try {
    if (action === "create") {
      await seedEmployees()
    } else if (action === "delete") {
      await deleteEmployees()
    }
    console.log(`Done Seeding. Action = ${action}`)
    return NextResponse.json({success: true})
  } catch (e) {
    console.log(`Failed Seeding. Action = ${action}`)
    return NextResponse.json({success: false, error: e})

  }

}



