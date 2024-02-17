


import { NextRequest, NextResponse } from 'next/server';
import { MembershipLevel, ServiceType } from '../../types/enums';



export async function GET(req: NextRequest){
  const membershipLevelsArray = Object.keys(MembershipLevel).map(key => ({
    name: MembershipLevel[key as keyof typeof MembershipLevel],
    code: MembershipLevel[key as keyof typeof MembershipLevel],
  }));

  const serviceTypeArray = Object.keys(ServiceType).map(key => ({
    name: ServiceType[key as keyof typeof ServiceType],
    code: ServiceType[key as keyof typeof ServiceType],
  }));

  return NextResponse.json({ enums: {
      serviceTypes: serviceTypeArray,
      membershipLevel: membershipLevelsArray
    }
  })
}


