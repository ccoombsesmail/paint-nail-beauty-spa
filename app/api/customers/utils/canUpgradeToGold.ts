import { $Enums, Customer } from '@prisma/client';

export function canUpgradeToGold(customer: Customer): boolean {
  // Check if the user is currently Bronze or Silver
  const isEligibleMembership = customer.membershipLevel === $Enums.Membership.Bronze || customer.membershipLevel === $Enums.Membership.Silver;

  if (!customer.membershipActivationDate) return true
  if (!isEligibleMembership || customer.membershipLevel === $Enums.Membership.Gold) return false


  // Calculate the difference in days between now and the membership start date
  const now = new Date();
  const membershipStartDate = new Date(customer.membershipActivationDate);
  const diffTime = Math.abs(now.getTime() - customer.membershipActivationDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if the membership started within the last 60 days
  console.log(diffDays)
  return diffDays <= 60;
}
