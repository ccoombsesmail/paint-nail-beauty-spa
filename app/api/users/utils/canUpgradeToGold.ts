import { MembershipLevel } from '../../../types/enums';
import { User }  from '@prisma/client'

export function canUpgradeToGold(user: User): boolean {
  // Check if the user is currently Bronze or Silver
  const isEligibleMembership = user.membershipLevel.toString() === MembershipLevel.Bronze || user.membershipLevel.toString() === MembershipLevel.Silver;

  if (!user.membershipStartDate) return true
  if (!isEligibleMembership || user.membershipLevel.toString() === MembershipLevel.Gold) return false


  // Calculate the difference in days between now and the membership start date
  const now = new Date();
  const membershipStartDate = new Date(user.membershipStartDate);
  const diffTime = Math.abs(now.getTime() - user.membershipStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if the membership started within the last 60 days
  return diffDays <= 60;
}
