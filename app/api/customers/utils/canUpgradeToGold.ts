import { $Enums, Customer } from '@prisma/client';

export function canUpgradeToGold(customer: Customer): boolean {
  // Check if the user is currently Bronze or Silver
  const isEligibleMembership = customer.membershipLevel.toString() === $Enums.Membership.Bronze || customer.membershipLevel.toString() === $Enums.Membership.Silver;

  if (!customer.membershipStartDate) return true
  if (!isEligibleMembership || customer.membershipLevel.toString() === $Enums.Membership.Gold) return false


  // Calculate the difference in days between now and the membership start date
  const now = new Date();
  const membershipStartDate = new Date(customer.membershipStartDate);
  const diffTime = Math.abs(now.getTime() - customer.membershipStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if the membership started within the last 60 days
  return diffDays <= 60;
}
