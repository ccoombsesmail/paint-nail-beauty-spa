import { $Enums } from '@prisma/client';


export const membershipTypeEnumMap = new Map<string, string>([
    [$Enums.Membership.Gold, "Gold"],
    [$Enums.Membership.Silver, "Silver"],
    [$Enums.Membership.Bronze, "Bronze"],
    [$Enums.Membership.NonMember, "Non Member"],
    [$Enums.Membership.GoldNonActive, "Gold (Not Active)"],
    [$Enums.Membership.SilverNonActive, "Silver (Not Active)"],
    [$Enums.Membership.BronzeNonActive, "Bronze (Not Active)"]
  ]
)





export const serviceTypeEnumMap = new Map<string, string>([
    [$Enums.ServiceType.SCP, "Single Color Pedicure"],
    [$Enums.ServiceType.SCM, "Single Color Manicure"],
    [$Enums.ServiceType.PD, "Pedicure Design"],
    [$Enums.ServiceType.MD, "Manicure Design"],
    [$Enums.ServiceType.EE, "Eyelash Extension"]
  ]
)


export const paymentMethodTypeEnumMap = new Map<string, string>([
      [$Enums.PaymentMethod.Venmo, "Venmo"],
      [$Enums.PaymentMethod.Zelle, "Zelle"],
      [$Enums.PaymentMethod.PayPal, "PayPal"],
      [$Enums.PaymentMethod.Cash, "Cash"],
      [$Enums.PaymentMethod.CreditCard, "Credit Card"]
  ]
)

export const serviceCategoryTypeEnumMap = new Map<string, string>([
    [$Enums.ServiceCategory.Nail, "Nail"],
    [$Enums.ServiceCategory.Eyelash, "Eyelash"],
    [$Enums.ServiceCategory.Facial, "Facial"],
    [$Enums.ServiceCategory.BodySpa, "Body Spa"],
  ]
)

