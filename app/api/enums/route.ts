


import { NextRequest, NextResponse } from 'next/server';
import { membershipTypeEnumMap, paymentMethodTypeEnumMap, serviceTypeEnumMap } from '../../types/enums';

import { $Enums } from '@prisma/client'

export async function GET(req: NextRequest){
  const membershipTypes = Object.keys($Enums.Membership).map(key => ({
    name: membershipTypeEnumMap.get(key),
    code: $Enums.Membership[key as keyof typeof $Enums.Membership],
  }));


  const serviceTypes = Object.keys($Enums.ServiceType).map(key => ({
    name: serviceTypeEnumMap.get(key),
    code: $Enums.ServiceType[key as keyof typeof $Enums.ServiceType],
  }));

  const paymentMethodTypes = Object.keys($Enums.PaymentMethod).map(key => ({
    name: paymentMethodTypeEnumMap.get(key),
    code: $Enums.PaymentMethod[key as keyof typeof $Enums.PaymentMethod],
  }));

  return NextResponse.json({ enums: {
      serviceTypes,
      membershipTypes,
      paymentMethodTypes
    }
  })
}


