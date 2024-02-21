


import { NextRequest, NextResponse } from 'next/server';
import {
  membershipTypeEnumMap,
  paymentMethodTypeEnumMap,
  serviceCategoryTypeEnumMap,
  serviceTypeEnumMap
} from '../../types/enums';

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

  const serviceCategoryTypes = Object.keys($Enums.ServiceCategory).map(key => ({
    name: serviceCategoryTypeEnumMap.get(key),
    code: $Enums.ServiceCategory[key as keyof typeof $Enums.ServiceCategory],
  }));

  return NextResponse.json({ enums: {
      serviceTypes,
      membershipTypes,
      paymentMethodTypes,
      serviceCategoryTypes
    }
  })
}


