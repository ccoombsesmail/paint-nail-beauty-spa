'use client';

import React, { useState } from 'react';

import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { Transaction, Visit } from '@prisma/client';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { useMutation } from 'react-query';
import { AxiosError } from 'axios';
import { toast, Toaster } from 'sonner';

import { useRouter } from 'next/navigation';
import { deleteTransaction } from '../../../../client-api/transactions/transaction-queries';
import { deleteVisit } from '../../../../client-api/visits/visit-queries';

export default function DeleteTransaction({
                                visit
                              }: {
  visit: Visit
}) {

  const router = useRouter();

  const { mutateAsync } = useMutation(deleteVisit, {
    onSuccess: async (data) => {
      setTimeout(() => {
        router.push('/transactions');
      }, 2000)
    }
  });


  const [isSubmitting, setIsSubmitting] = useState(false);

  const onConfirmClick = async () => {
    try {
      toast.promise(mutateAsync(visit.id), {
        loading: 'Deleting Visit...',
        success: (data: any) => {
          return `Visit has been Deleted`;
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
      message: 'Are you sure you want to delete this visit?',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      className: 'max-w-64 cy-transaction-delete-confirm-popup',
      accept: onConfirmClick
    });
  };


  return (

    <Panel header='Delete Visit'>
      <div className='mt-4 flex w-full justify-between pb-20'>
        <ConfirmPopup />

        <Button
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={openConfirmPopup}
          label='Delete Visit'
          className='h-[48px]'
          id='cy-visit-delete-btn'
        />
      </div>
      <Toaster richColors position='top-right' />

    </Panel>


  );
}
