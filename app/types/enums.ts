import { $Enums } from '@prisma/client';



export const nonActiveMembershipLevels = [$Enums.Membership.GoldNonActive.toString(), $Enums.Membership.SilverNonActive.toString(), $Enums.Membership.BronzeNonActive.toString()]
export const bronzeOrHigher = [$Enums.Membership.Bronze.toString(), $Enums.Membership.Silver.toString(), $Enums.Membership.Gold.toString()]
export const bronzeOrSilver = [$Enums.Membership.Bronze.toString(), $Enums.Membership.Silver.toString()]

export const silverOrGold = [$Enums.Membership.Gold.toString(), $Enums.Membership.Silver.toString()]

export const belowGold = [$Enums.Membership.Silver.toString(), $Enums.Membership.Bronze.toString(), $Enums.Membership.NonMember.toString(), ...nonActiveMembershipLevels]

export const belowSilver = [$Enums.Membership.Bronze.toString(), $Enums.Membership.NonMember.toString(), ...nonActiveMembershipLevels]

export const belowBronze = [$Enums.Membership.NonMember.toString(), ...nonActiveMembershipLevels]


export const bronzeOrNonActiveBronze = [$Enums.Membership.Bronze.toString(), $Enums.Membership.BronzeNonActive.toString()]

export const membershipTypeEnumMap = new Map<string, string>([
    [$Enums.Membership.Gold, "Gold"],
    [$Enums.Membership.Silver, "Silver"],
    [$Enums.Membership.Bronze, "Bronze"],
    [$Enums.Membership.NonMember, "Non Member"],
    [$Enums.Membership.GoldNonActive, "Gold (Non Active)"],
    [$Enums.Membership.SilverNonActive, "Silver (Non Active)"],
    [$Enums.Membership.BronzeNonActive, "Bronze (Non Active)"]
  ]
)

export const reversedMembershipTypeEnumMap = new Map<string, string>();

membershipTypeEnumMap.forEach((value, key) => {
  reversedMembershipTypeEnumMap.set(value, key);
});




export const serviceTypeEnumMap = new Map<string, string>([
  [$Enums.ServiceType.Package, "Package"],
  [$Enums.ServiceType.NailRemoval, "Nail Removal"],
  [$Enums.ServiceType.HandCare, "Hand Care"],
  [$Enums.ServiceType.FootCare, "Foot Care"],
  [$Enums.ServiceType.HandNailRemovalExtraCare, "Hand: Nail Removal + Extra Care"],
  [$Enums.ServiceType.FootNailRemovalExtraCare, "Foot: Nail Removal + Extra Care"],
  [$Enums.ServiceType.ManicurePedicureSingleColor, "Manicure/Pedicure Single Color"],
  [$Enums.ServiceType.ManicurePedicureCatEyeSingleColor, "Manicure/Pedicure Cat-Eye Single Color"],
  [$Enums.ServiceType.ManicurePedicureOmbreDesign, "Manicure/Pedicure Ombre Design"],
  [$Enums.ServiceType.ManicurePedicureCustomDesign, "Manicure/Pedicure Custom Design"],
  [$Enums.ServiceType.ManicurePedicureNailExtensionCustomDesign, "Manicure/Pedicure Nail Extension + Custom Design"],
  [$Enums.ServiceType.AddOnService, "Add-On Service"],
  [$Enums.ServiceType.UpperEyelashExtensions, "Upper Eyelash Extensions"],
  [$Enums.ServiceType.LowerEyelashExtensions, "Lower Eyelash Extensions"],
  [$Enums.ServiceType.UpperEyelashRefill, "(Upper) Eyelash Refill"],
  [$Enums.ServiceType.EyelashExtensionsRemoval, "Eyelash Extensions Removal"],
  [$Enums.ServiceType.ColoredEyelashExtensionsAddOn, "Colored Eyelash Extensions Add-On"],
  [$Enums.ServiceType.AdditionalService, "Additional Service"],
  [$Enums.ServiceType.CavitationBodySlimmingTreatment, "80K Cavitation Body Slimming Treatment"],
  [$Enums.ServiceType.KoreanLiftingTighteningBodyTreatment, "Korean Lifting & Tightening Body Treatment"],
  [$Enums.ServiceType.MermaidGingerDetoxSteamTreatment, "Mermaid Ginger Detox Steam Treatment"],
  [$Enums.ServiceType.MudDetoxTreatment, "Mud Detox Treatment"],
  [$Enums.ServiceType.ScalpMassageAddOn, "Scalp Massage Add-On"],
  [$Enums.ServiceType.HydrafacialSignature, "Hydrafacial Signature"],
  [$Enums.ServiceType.HydrafacialDeluxe, "Hydrafacial Deluxe"],
  [$Enums.ServiceType.HydrafacialPlatinum, "Hydrafacial Platinum"],
  [$Enums.ServiceType.HydrafacialScalpTreatment, "Hydrafacial Scalp Treatment"],
  [$Enums.ServiceType.HydrafacialLipTreatmentAddOn, "Hydrafacial Lip Treatment Add-On"],
  [$Enums.ServiceType.HydrafacialUnderEyeTreatmentAddOn, "Hydrafacial Under-Eye Treatment Add-On"],
  [$Enums.ServiceType.HydrafacialNeckTreatmentAddOn, "Hydrafacial Neck Treatment Add-On"],
  [$Enums.ServiceType.MicroSonicPeelDetoxificationTreatment, "Micro/Sonic Peel Detoxification Treatment"],
  [$Enums.ServiceType.MoisturizingFirmingAntiAgingTargetedSkinCareTreatment, "Moisturizing, Firming, Anti-Aging, & Targeted Skin Care Treatment (Anti-Acne, Detoxification, Whitening)"],
  [$Enums.ServiceType.FacialCareAddOn, "Facial Care Add-On"],
  [$Enums.ServiceType.FacialSlimmingMassageAddOn, "Facial Slimming Massage Add-On"],
  [$Enums.ServiceType.SemiPermanentHairRemovalLipBikiniLineBikiniFaceFrontBackArms, "Semi-Permanent Hair Removal (Lip Hair, Underarms, Bikini Line, Full Bikini, Full Face, Front/Back Arms)"],
  [$Enums.ServiceType.SemiPermanentHairRemovalFullArmsFullLegsThighsCalves, "Semi-Permanent Hair Removal (Full Arms, Full Legs, Thighs/Calves )"],
  [$Enums.ServiceType.FullBodySemiPermanentHairRemoval, "Full Body Semi-Permanent Hair Removal"],
  [$Enums.ServiceType.WaxingCheeksLipEyebrowsFullFaceUnderarmsBikiniAreaButtocks, "Waxing (Cheeks, Lip hair, Eyebrows, Full Face, Underarms, Bikini Area, Buttocks)"],
  [$Enums.ServiceType.WaxingFrontBackArmsFullArmsFullLegsThighsCalvesBack, "Waxing (Front/Back Arms, Full Arms, Full Legs, Thighs/Calves, Back)"]
]);


export const reversedServiceTypeEnumMap = new Map<string, string>();

serviceTypeEnumMap.forEach((value, key) => {
  reversedServiceTypeEnumMap.set(value, key);
});

export const paymentMethodTypeEnumMap = new Map<string, string>([
      [$Enums.PaymentMethod.Venmo, "Venmo"],
      [$Enums.PaymentMethod.Zelle, "Zelle"],
      [$Enums.PaymentMethod.PayPal, "PayPal"],
      [$Enums.PaymentMethod.WeChat, "WeChat"],
      [$Enums.PaymentMethod.Cash, "Cash"],
      [$Enums.PaymentMethod.CreditCard, "Credit Card"]
  ]
)

export const reversedPaymentMethodTypeEnumMap = new Map<string, string>();

paymentMethodTypeEnumMap.forEach((value, key) => {
  reversedPaymentMethodTypeEnumMap.set(value, key);
});

export const serviceCategoryTypeEnumMap = new Map<string, string>([
    [$Enums.ServiceCategory.Nail, "Nail"],
    [$Enums.ServiceCategory.Eyelash, "Eyelash"],
    [$Enums.ServiceCategory.Facial, "Facial"],
    [$Enums.ServiceCategory.BodySpa, "Body Spa"],
    [$Enums.ServiceCategory.HairRemoval, "Hair Removal"]
  ]
)

