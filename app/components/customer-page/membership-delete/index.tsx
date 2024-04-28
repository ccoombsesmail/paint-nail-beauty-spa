'use client';

import React, { useState } from 'react';

import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { Customer } from '@prisma/client';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { useMutation } from 'react-query';
import { deleteMembership, editMembership } from '../../../client-api/cutomers/customer-queries';
import { AxiosError } from 'axios';
import { toast, Toaster } from 'sonner';

import { useRouter } from 'next/navigation';

export default function MembershipDelete(
  {
    customer, unlock, masterCode
  }
    : {
    customer: Customer, unlock: boolean, masterCode: string
  }
) {

  const router = useRouter()

  const { mutateAsync } = useMutation(deleteMembership, {
    onSuccess: async (data) => {
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  });


  const [isSubmitting, setIsSubmitting] = useState(false);

  const onConfirmClick = async () => {
    try {

      toast.promise(mutateAsync(customer.id), {
        loading: 'Deleting Member...',
        success: (data: any) => {
          return `Member has been Deleted`;
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
      message: 'Are you sure you want to delete this member?',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      className: 'max-w-64 cy-membership-delete-confirm-popup',
      accept: onConfirmClick
    });
  };


  return (

    <Panel header='Delete Member'>
      <div className='mt-4 flex w-full justify-between pb-20'>
        <ConfirmPopup />

        <Button
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={openConfirmPopup}
          label='Delete Member'
          className='h-[48px]'
          id='cy-membership-delete-btn'
        />
      </div>
      <Toaster richColors position='top-right' />

    </Panel>


  );
}
