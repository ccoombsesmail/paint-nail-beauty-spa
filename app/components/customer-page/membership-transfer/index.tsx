'use client';

import React, { useMemo, useState } from 'react';

import { Panel } from 'primereact/panel';
import {
  SearchableUserSelectNonFormik
} from '../../forms/formik/selects';
import { Button } from 'primereact/button';
import { Customer } from '@prisma/client';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { useMutation, useQuery } from 'react-query';
import { editMembership, transferMembership } from '../../../client-api/cutomers/customer-queries';
import { AxiosError } from 'axios';
import { toast, Toaster } from 'sonner';
import { belowSilver, silverOrGold } from '../../../types/enums';


export default function MembershipTransfer({ customer, refetchCustomer, unlock, masterCode }:
                                             { customer: Customer, refetchCustomer: () => Promise<Customer>, unlock: boolean, masterCode: string }) {
  const [selectedFromCustomer, setSelectedFromCustomer] = useState<Customer | null>(customer);
  const [selectedToCustomer, setSelectedToCustomer] = useState<Customer | null>(null);

  const { mutateAsync } = useMutation(transferMembership, {
    onSuccess: async (data) => {
      const customer = await refetchCustomer();

    }
  });


  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysSinceStartDate = useMemo(() => {
    if (!customer.membershipActivationDate) return Number.MIN_VALUE;
    const now = new Date();
    const membershipActivationDate = new Date(customer.membershipActivationDate);
    const diffTime = Math.abs(now.getTime() - membershipActivationDate.getTime() || 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [customer]);


  const onConfirmClick = async () => {
    try {
      if (!selectedFromCustomer || !selectedToCustomer) {
        toast.error('Something Went Wrong');
        return;
      }
      const payload = { masterCode, fromCustomerId: selectedFromCustomer.id, toCustomerId: selectedToCustomer.id };
      toast.promise(mutateAsync(payload), {
        loading: 'Transferring Membership...',
        success: async (data: any) => {
          return `Membership has been transferred`;
        },
        error: (data: AxiosError<{ error: string }>) => {
          return `${data.response?.data.error}`;
        }
      });

    } catch (error) {
      console.error('Error:', error);
    }
    setIsSubmitting(false);
  };


  const openConfirmPopup = (event: any) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Are you sure you want to proceed? Membership can only be transferred once',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      className: 'max-w-64 transfer-membership-confirm-popup',
      accept: onConfirmClick
    });
  };


  const { reason, memberCanTransfer } = useMemo(() => {
    if (unlock) return { reason: '', memberCanTransfer: true };
    if (!silverOrGold.includes(customer.membershipLevel)) {
      return { reason: 'Only Activated Silver Or Gold Members Can Transfer Their Membership', memberCanTransfer: false };
    }
    if (customer.membershipTransferReceivedOn) {
      return { reason: 'Membership Can Only Be Transferred Once', memberCanTransfer: false };
    }
    if (daysSinceStartDate > 365) {
      return { reason: 'Membership Can Only Be Transferred Within The First Year', memberCanTransfer: false };
    }
    if (!customer.canTransferMembership) {
      return { reason: 'Membership Cannot Be Transferred', memberCanTransfer: false };
    }
    return { reason: '', memberCanTransfer: true };
  }, [unlock, customer.canTransferMembership, customer.membershipLevel, customer.membershipTransferReceivedOn, daysSinceStartDate]);

  return (

    <Panel header='Transfer Customer Membership'>

      <div className='mt-4 flex w-full justify-between pb-20'>
        {memberCanTransfer ? (
          <div className='flex flex-col gap-6'>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <span>From</span>
              </div>
              <div className='flex-1'>
                <i className='pi pi-arrow-right'></i>
              </div>
              <div className='flex-1 w-[32rem]'>
                <SearchableUserSelectNonFormik
                  width='w-[22rem]'
                  name='customerId'
                  placeholder='From Customer'
                  setSelectedCustomer={setSelectedFromCustomer}
                  initValue={customer}
                  readOnly
                  disabled
                />
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <span>To</span>
              </div>
              <div className='flex-1'>
                <i className='pi pi-arrow-right'></i>
              </div>
              <div className='flex-1 w-[32rem]'>
                <SearchableUserSelectNonFormik
                  id='cy-transfer-membership-to-input'
                  width='w-[22rem]'
                  name='customerId'
                  placeholder='To Customer'
                  setSelectedCustomer={setSelectedToCustomer}
                  fromCustomer={customer}
                />
              </div>

            </div>
          </div>
        ) : (
          <span
            className='flex justify-center p-button p-component p-button-raised p-button-text h-[48px] min-w-[200px] my-6'>
         {reason}
        </span>

        )}
        <ConfirmPopup />

        <Button
          loading={isSubmitting}
          disabled={isSubmitting || !memberCanTransfer}
          onClick={openConfirmPopup}
          label='Transfer Membership'
          className='h-[48px]'
          id='cy-membership-transfer-btn'

        />
      </div>

      <Toaster richColors position='top-right' />

    </Panel>


  );
}
