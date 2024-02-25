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
import {
  belowBronze,
  belowGold, belowSilver,
  bronzeOrHigher,
  bronzeOrSilver,
  nonActiveMembershipLevels,
  reversedMembershipTypeEnumMap
} from '../../../types/enums';

export default function MembershipUpdate({ customer, refetchCustomer } : { customer: Customer, refetchCustomer: () => Promise<Customer>}) {
  const [option, setOption] = useState({
    name: customer.membershipLevel,
    code: customer.membershipLevel.replaceAll(' ', '').replace('(', '').replace(')', '')
  });

  const { mutateAsync } = useMutation(editMembership, {
    onSuccess: async (data) => {
      const customer = await refetchCustomer()
      // @ts-ignore
      setOption({
        // @ts-ignore
        name: customer.data.membershipLevel,
        // @ts-ignore
        code: customer.data.membershipLevel.replaceAll(' ', '').replace('(', '').replace(')', '')
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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const daysSinceStartDate = useMemo(() => {
    if (!customer.membershipActivationDate) return Number.MIN_VALUE
    const now = new Date();
    const membershipActivationDate = new Date(customer.membershipActivationDate);
    const diffTime = Math.abs(now.getTime() - membershipActivationDate.getTime() || 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [customer])

  const onChange = (e: any) => {
    setOption(e.value)
  }
  const allowedOptions = useMemo(() => enums.membershipTypes.map((option: {name: string, code: string}) => {
    // const membershipLevelCode = reversedMembershipTypeEnumMap.get()
    const customerCurrentMembeshipCode = reversedMembershipTypeEnumMap.get(customer.membershipLevel)
    if (customerCurrentMembeshipCode === option.code) return option
    if (customerCurrentMembeshipCode === $Enums.Membership.Gold &&  belowGold.includes(option.code)) {
      return {
        ...option,
        disabled: true
      }
    }

    if (customerCurrentMembeshipCode === $Enums.Membership.Silver && belowSilver.includes(option.code)) {
      return {
        ...option,
        disabled: true
      }
    }

    if (customerCurrentMembeshipCode === $Enums.Membership.Bronze && belowBronze.includes(option.code)) {
      return {
        ...option,
        disabled: true
      }
    }
    if (customerCurrentMembeshipCode === $Enums.Membership.GoldNonActive && option.code !== $Enums.Membership.Gold){
      return {
        ...option,
        disabled: true
      }
    }
    if (customerCurrentMembeshipCode === $Enums.Membership.SilverNonActive && option.code !== $Enums.Membership.Silver){
      return {
        ...option,
        disabled: true
      }
    }
    if (customerCurrentMembeshipCode === $Enums.Membership.BronzeNonActive && option.code !== $Enums.Membership.Bronze){
      return {
        ...option,
        disabled: true
      }
    }
    if (!customer.membershipPurchaseDate) return option
    if (customer.membershipLevel === "Bronze" && option.name === "Silver") {
      return {
        ...option,
        disabled: true
      }
    }
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
  }), [enums.membershipTypes, customer.membershipLevel, customer.membershipPurchaseDate, daysSinceStartDate])


  const onConfirmClick = async () => {
    try {

      const payload = { customerId: customer.id, newMembershipLevel: option.code}
      toast.promise(mutateAsync(payload), {
        loading: 'Updating Membership...',
        success: async (data: any) => {
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

  const { text1, text2 } = useMemo(() => {
    let text1 = '', text2 = ''
    const customerMembershipLevelCode = reversedMembershipTypeEnumMap.get(customer.membershipLevel) || ''
    if (customerMembershipLevelCode === $Enums.Membership.NonMember) {
      return { text1: 'Not A Member', text2: '' }
    }
    if (nonActiveMembershipLevels.includes(customerMembershipLevelCode)) {
      return { text1: 'Not Active', text2: 'Waiting For Activation' }
    }
    if (bronzeOrSilver.includes(customerMembershipLevelCode) && customer.membershipActivationDate) {
      const eligibleForUpgrade = daysSinceStartDate <= 60
      if (eligibleForUpgrade) {
        text2 = `${60 - daysSinceStartDate} Days Left To Upgrade`
      } else {
        text2 ='Upgrade Period Has Passed'
      }
      return { text1: `Activated ${formatDate(new Date(customer.membershipActivationDate))}`, text2 }
    }
    if (customerMembershipLevelCode === $Enums.Membership.Gold) {
      return { text1: `Full Membership`, text2: '' }
    }
    return { text1, text2 }
  }, [daysSinceStartDate, customer])


  return (

    <Panel header="Update Customer Membership">

      <div className='mt-4 flex w-full justify-between pb-20'>
        <div className='flex  items-center'>
        <div className='flex relative flex-col items-center mr-4'>

          <span className='flex justify-center p-button p-component p-button-raised p-button-text h-[48px] min-w-[220px]'>
             {text1}
          </span>
          <span className='mx-4 text-red-500 font-semibold absolute bottom-0 translate-y-[30px]'>
            {text2}
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
