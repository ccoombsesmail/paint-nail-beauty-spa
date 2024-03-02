'use client';

import React, { useMemo, useState } from 'react';

import { Panel } from 'primereact/panel';
import {
  SearchableUserSelectNonFormik
} from '../../forms/formik/selects';
import { Button } from 'primereact/button';
import { $Enums, Customer } from '@prisma/client';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { useMutation } from 'react-query';
import { transferBalance } from '../../../client-api/cutomers/customer-queries';
import { AxiosError } from 'axios';
import { toast, Toaster } from 'sonner';


export default function BalanceTransfer({ customer, refetchCustomer, unlock, masterCode }
                                          : { customer: Customer, refetchCustomer: () => Promise<Customer>, unlock: boolean, masterCode:string }) {
  const [selectedFromCustomer, setSelectedFromCustomer] = useState<Customer | null>(customer);
  const [selectedToCustomer, setSelectedToCustomer] = useState<Customer | null>(null);

  const { mutateAsync } = useMutation(transferBalance, {
    onSuccess: async (data) => {
      const customer = await refetchCustomer();

    }
  });


  const [isSubmitting, setIsSubmitting] = useState(false);


  const onConfirmClick = async () => {
    try {
      if (!selectedFromCustomer || !selectedToCustomer) {
        toast.error('Something Went Wrong');
        return;
      }
      const payload = {masterCode, fromCustomerId: selectedFromCustomer.id, toCustomerId: selectedToCustomer.id };
      toast.promise(mutateAsync(payload), {
        loading: 'Transferring Balance...',
        success: async (data: any) => {
          return `Balance has been transferred`;
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
      message: 'Are you sure you want to proceed? Cashback Balance can only be transferred once',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      className: 'max-w-64',
      accept: onConfirmClick
    });
  };


  const { reason, memberCanTransfer } = useMemo(() => {
    if (unlock) return { reason: '', memberCanTransfer: true };
    if (customer.membershipLevel !== $Enums.Membership.Gold) {
      return { reason: 'Only Activated Gold Members Can Transfer Their Cashback Balance', memberCanTransfer: false };
    }
    if (Number(customer.cashbackBalance) === 0) {
      return { reason: 'No Balance To Transfer', memberCanTransfer: false };
    }
    if (customer.cashbackBalanceTransferInitiatedOn) {
      return { reason: 'Cashback Balance Can Only Be Transferred Once', memberCanTransfer: false };
    }
    if (!customer.canTransferCashbackBalance) {
      return { reason: 'Cashback Balance Cannot Be Transferred', memberCanTransfer: false };
    }
    return { reason: '', memberCanTransfer: true };
  }, [unlock, customer.canTransferCashbackBalance, customer.cashbackBalance, customer.cashbackBalanceTransferInitiatedOn, customer.membershipLevel]);

  const headerTemplate = useMemo(() => {
    return (
      <div className='flex flex-col gap-6'>
       <span>
        Transfer Customer Cashback Balance
      </span>
        <span>
          Current Balance: {Number(customer.cashbackBalance)}
        </span>
      </div>

    );
  }, [customer.cashbackBalance]);
  return (

    <Panel header={headerTemplate}>

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
                  id='cy-transfer-balance-to-input'
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
          <span className='flex justify-center p-button p-component p-button-raised p-button-text h-[48px] min-w-[200px] my-6'>
            {reason}
          </span>
        )}
        <ConfirmPopup />

        <Button
          loading={isSubmitting}
          disabled={isSubmitting || !memberCanTransfer}
          onClick={openConfirmPopup}
          label='Transfer Balance'
          className='h-[48px]'
          id='cy-balance-transfer-btn'
        />
      </div>

      <Toaster richColors position='top-right' />

    </Panel>


  );
}
