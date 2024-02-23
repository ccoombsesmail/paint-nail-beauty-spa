"use client"

import React, { useMemo, useState } from 'react';

import { Panel } from 'primereact/panel';
import { selectedMembershipTemplate } from '../../forms/formik/selects';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { $Enums, Customer } from '@prisma/client';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { useMutation, useQuery } from 'react-query';
import { getEnums } from '../../../client-api/enums/enum-queries';
import { formatDate } from '../../../utils/format-date';
import { editMembership } from '../../../client-api/cutomers/customer-queries';
import { AxiosError } from 'axios';
import { toast, Toaster } from 'sonner';
import { reversedMembershipTypeEnumMap } from '../../../types/enums';

const nonActiveMembershipLevels = [$Enums.Membership.GoldNonActive, $Enums.Membership.SilverNonActive, $Enums.Membership.BronzeNonActive]
const bronzeOrHigher = [$Enums.Membership.Bronze, $Enums.Membership.Silver, $Enums.Membership.Gold]
export default function MembershipUpdate({ customer } : { customer: Customer}) {
  const [option, setOption] = useState({
    name: customer.membershipLevel,
    code: customer.membershipLevel.replaceAll(' ', '').replace('(', '').replace(')', '')
  });

  const { mutateAsync } = useMutation(editMembership, {
    onSuccess: (data) => {
      console.log(data)
      setOption({
        name: data.membershipLevel,
        code: data.membershipLevel
      })
    },
  });
  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceTypes: [],
      paymentMethodTypes: []
    }
  });
  const [customerInfo, setCustomerInfo] = useState<Customer>(customer)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const daysSinceStartDate = useMemo(() => {
    if (!customerInfo.membershipActivationDate) return Number.MIN_VALUE
    const now = new Date();
    const membershipActivationDate = new Date(customerInfo.membershipActivationDate);
    const diffTime = Math.abs(now.getTime() - membershipActivationDate.getTime() || 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [customerInfo])

  const onChange = (e: any) => {
    setOption(e.value)
  }
  const allowedOptions = useMemo(() => enums.membershipTypes.map((option: {name: string, code: string}) => {
    // const membershipLevelCode = reversedMembershipTypeEnumMap.get()

    if (reversedMembershipTypeEnumMap.get(customerInfo.membershipLevel) === option.code) return option
    if (reversedMembershipTypeEnumMap.get(customerInfo.membershipLevel) === $Enums.Membership.Gold && option.code !== $Enums.Membership.Gold) {
      return {
        ...option,
        disabled: true
      }
    }
    if (reversedMembershipTypeEnumMap.get(customerInfo.membershipLevel) === $Enums.Membership.GoldNonActive && option.code !== $Enums.Membership.Gold){
      console.log(reversedMembershipTypeEnumMap.get(customerInfo.membershipLevel))
      return {
        ...option,
        disabled: true
      }
    }
    if (reversedMembershipTypeEnumMap.get(customerInfo.membershipLevel) === $Enums.Membership.SilverNonActive && option.code !== $Enums.Membership.Silver){
      return {
        ...option,
        disabled: true
      }
    }
    if (reversedMembershipTypeEnumMap.get(customerInfo.membershipLevel) === $Enums.Membership.BronzeNonActive && option.code !== $Enums.Membership.Bronze){
      return {
        ...option,
        disabled: true
      }
    }
    if (!customerInfo.membershipPurchaseDate) return option
    if (customerInfo.membershipLevel === "Bronze" && option.name === "Silver") {
      return {
        ...option,
        disabled: true
      }
    }
    console.log(daysSinceStartDate)
    if ((daysSinceStartDate >= 60 && option.name === "Gold")) {
      return {
        ...option,
        disabled: true
      }
    }
    // @ts-ignore
    if (bronzeOrHigher.includes(customer.membershipLevel) && nonActiveMembershipLevels.includes(option.code)){
      return {
        ...option,
        disabled: true
      }
    }
    return option
  }), [enums.membershipTypes, customerInfo.membershipLevel, customerInfo.membershipPurchaseDate, daysSinceStartDate, customer.membershipLevel])


  const onConfirmClick = async () => {
    try {

      const payload = { customerId: customerInfo.id, newMembershipLevel: option.code}
      toast.promise(mutateAsync(payload), {
        loading: 'Updating Membership...',
        success: (data: any) => {
          return `Membership has been updated`;
        },
        error: (data: AxiosError<{ error: string }>) => {
          return `${data.response?.data.error}`;
        },
      });

    } catch (error) {
      console.error('Error:', error);
    }
    setIsSubmitting(false);
  }


  const openConfirmPopup = (event: any) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Are you sure you want to proceed? Membership upgrade attempts are limited',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      className: 'max-w-64',
      accept: onConfirmClick
    });
  };


  const isBronzeOrSilver = reversedMembershipTypeEnumMap.get(customerInfo.membershipLevel) === $Enums.Membership.Bronze || reversedMembershipTypeEnumMap.get(customerInfo.membershipLevel) === $Enums.Membership.Silver
  const showDaysLeftToActive = customer.membershipActivationDate && daysSinceStartDate <= 60 && isBronzeOrSilver
  return (

    <Panel header="Update Customer Membership">

      <div className='mt-4 flex w-full justify-between pb-20'>
        <div className='flex  items-center'>
        <div className='flex relative flex-col items-center mr-4'>

          <span className='p-button p-component p-button-raised p-button-text h-[48px]'>
             {customer.membershipActivationDate ? `Activated ${formatDate(new Date(customer.membershipActivationDate))}` : 'Not Activated'}
          </span>
          <span className='mx-4 text-red-500 font-semibold absolute bottom-0 translate-y-[30px]'>
            {showDaysLeftToActive ? `${60 - daysSinceStartDate} Days Left To Upgrade` : 'Not Eligible To Upgrade'}
          </span>

        </div>
        <span className="p-float-label ">
           <Dropdown
             id="membership_select"
             valueTemplate={selectedMembershipTemplate}
             value={option} onChange={onChange}
             options={allowedOptions}
             optionLabel="name"
             placeholder="Select Membership"
             className="w-[24rem]"
           />
               <label htmlFor="membership_select">Select Membership</label>
            </span>
        </div>
        <ConfirmPopup />

        <Button loading={isSubmitting} disabled={isSubmitting} onClick={openConfirmPopup} label="Update Membership" className='h-[48px]' />
      </div>
      <Toaster richColors position='top-right'/>

    </Panel>


  );
}
