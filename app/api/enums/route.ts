


import { NextRequest, NextResponse } from 'next/server';
import {
  employmentStatusTypeEnumMap,
  membershipTypeEnumMap, organizationRoleTypeEnumMap,
  paymentMethodTypeEnumMap,
  serviceCategoryTypeEnumMap,
  serviceTypeEnumMap
} from '../../types/enums';

import { $Enums } from '@prisma/client'
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(req: NextRequest){

  const orgs = await clerkClient.organizations.getOrganizationList({})
  const orgNameMap = orgs.data.reduce((acc: { [key: string] : string}, org) => {
    acc[org.id] = org.name
    return acc
  }, {})
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

  const employmentStatusTypes = Object.keys($Enums.EmploymentStatus).map(key => ({
    name: employmentStatusTypeEnumMap.get(key),
    code: $Enums.EmploymentStatus[key as keyof typeof $Enums.EmploymentStatus],
  }));

  const organizationRoleTypes = Object.keys($Enums.OrganizationRole).map(key => ({
    name: $Enums.OrganizationRole[key as keyof typeof $Enums.OrganizationRole],
    code: organizationRoleTypeEnumMap.get(key),

  }));

  return NextResponse.json({ enums: {
      serviceTypes,
      membershipTypes,
      paymentMethodTypes,
      serviceCategoryTypes,
      employmentStatusTypes,
      organizationRoleTypes,
      orgNameMap
    }
  })
}


