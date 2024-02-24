"use client"

import React, {useEffect, useState } from 'react';
import { LoadingSpinner } from '../../components/loading-screen';
import { useParams } from 'next/navigation';
import { Field, Form, Formik } from 'formik';
import { FloatingLabelInput, ServiceDurationInput } from '../../components/forms/formik/inputs';
import {
  FloatingSelect, SearchableEmployeeSelect,
  SearchableUserSelect,
} from '../../components/forms/formik/selects';
import { Button } from 'primereact/button';
import * as Yup from 'yup';
import { Card } from 'primereact/card';
import { useMutation, useQuery } from 'react-query';
import { editTransaction, fetchTransaction } from '../../client-api/transactions/transaction-queries';
import { toast, Toaster } from 'sonner';
import { Calendar } from 'primereact/calendar';
import { Divider } from '@tremor/react';
import { getEnums } from '../../client-api/enums/enum-queries';
import { createTransaction } from '../../client-api/employees/employee-queries';
import { AxiosError } from 'axios';
import {
  paymentMethodTypeEnumMap,
  reversedPaymentMethodTypeEnumMap,
  reversedServiceTypeEnumMap,
  serviceTypeEnumMap
} from '../../types/enums';



const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
  serviceType: Yup.string().required('Service Type is required'),
  serviceDuration: Yup.number().required('Service Duration is Required'),
  totalServicePrice: Yup.number().required('Total Service Price is required'),
  actualPaymentCollected: Yup.number().required('Actual Payment Collected is required'),
  tip: Yup.number().required('Tip is required (enter 0 if none)'),
  paymentMethod: Yup.string().oneOf(['Venmo', 'Zelle', 'Cash', 'PayPal', 'CreditCard']).required('Payment Method is required'),
  technicianEmployeeId: Yup.string().required('Technician is required'),
  userEnteredDate: Yup.date().required("Transaction DateTime is Required")
});
export default function TransactionEditPage() {

  const params = useParams<{transactionId: string}>()
  const [isLoading, setIsLoading] = useState(true)
  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceTypes: [],
      paymentMethodTypes: []
    }
  });
  const { data: transaction, isLoading: isTransactionLoading, refetch } = useQuery(['transactions', params.transactionId], () => fetchTransaction(params.transactionId), {
    onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Transactions: ${error}`,),
  });

  const { mutateAsync } = useMutation(editTransaction, {
    onSuccess: () => {
      // Refetch customers list to reflect the new customer
      refetch()
    },

  });
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

  }, []);



  if (isLoading) return  <LoadingSpinner />


  return (

    <Card title="Edit Transaction">
      <Formik
        initialValues={{
          ...transaction
        }}
        validationSchema={validationSchema} // Add the validation schema to Formik
        onSubmit={async (values, { setSubmitting }) => {
          try {

            const transactionPayload = {
              ...values,
              serviceDuration: Number(values.serviceDuration),
            }

            console.log(transactionPayload)


            toast.promise(mutateAsync(transactionPayload), {
              loading: 'Updating Transaction...',
              success: (data: any) => {
                setSubmitting(false);
                return `Transaction has been updated`;
              },
              error: (data: AxiosError<{ error: string }>) => {
                setSubmitting(false);
                return `${data.response?.data.error}`;
              },
            });

          } catch (error) {
            console.error('Error:', error);
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className='flex flex-wrap gap-x-2 my-7 gap-y-8'>
            <Field
              name='userEnteredDate'
              as={Calendar}
              placeholder='Date'
              type='text'
              className='max-h-[50px] w-[22rem]'
              showIcon
              showButtonBar
              showTime
              iconPos='left'
              value={new Date(values.userEnteredDate)}
              setFieldValue={setFieldValue}

            />
            <Field
              width='w-[22rem]'
              name='customerId'
              initValue={transaction.customer}
              as={SearchableUserSelect}
              placeholder='Customer Search'
              setFieldValue={setFieldValue}
            />
            <Field
              width='w-[22rem]'
              name='technicianEmployeeId'
              initValue={transaction.employee}
              as={SearchableEmployeeSelect}
              placeholder='Technician Search'
              setFieldValue={setFieldValue}
              className='w-[22rem]'
            />

            <Field
              width='w-[22rem]'
              name='paymentMethod'
              as={FloatingSelect}
              setFieldValue={setFieldValue}
              placeholder='Payment Method'
              options={enums.paymentMethodTypes}
              initValue={{
                name: paymentMethodTypeEnumMap.get(transaction.paymentMethod),
                code: transaction.paymentMethod
              }}
              className='w-[22rem]'
            />
            <Field
              width='w-[22rem]'
              name='serviceType'
              as={FloatingSelect}
              initValue={{
                name: serviceTypeEnumMap.get(transaction.serviceType),
                code: transaction.serviceType
              }}
              setFieldValue={setFieldValue}
              placeholder='Service Type'
              type='text'
              options={enums.serviceTypes}
              className='w-[22rem]'

            />


            <Field
              name='serviceDuration'
              as={ServiceDurationInput}
              placeholder='Service Duration'
              type='text'
              className='w-[22rem]'

            />
            <Field
              name='totalServicePrice'
              as={FloatingLabelInput}
              placeholder='Total Service Price'
              type='number'
              className='w-[22rem]'
            />
            <Field
              name='discountedServicePrice'
              as={FloatingLabelInput}
              placeholder='Discounted Service Price'
              type='number'
              className='w-[22rem]'
            />
            <Field
              name='actualPaymentCollected'
              as={FloatingLabelInput}
              placeholder='Actual Payment Collected'
              type='number'
              className='w-[22rem]'


            />
            <Field
              name='tip'
              as={FloatingLabelInput}
              placeholder='Tip'
              type='number'
              className='w-[22rem]'

            />

            <Divider />
            <div className='flex w-full justify-end'>
              <Button type='submit' label='Submit' icon='pi pi-check' disabled={isSubmitting} />
            </div>
          </Form>
        )}
      </Formik>

      <Toaster richColors position='top-right' />

    </Card>


  );
}