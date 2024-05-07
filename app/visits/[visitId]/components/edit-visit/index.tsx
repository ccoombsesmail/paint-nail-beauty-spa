"use client"

import React, {useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Field, FieldArray, Form, Formik } from 'formik';

import { Button } from 'primereact/button';
import * as Yup from 'yup';
import { Card } from 'primereact/card';
import { useMutation, useQuery } from 'react-query';
import { toast, Toaster } from 'sonner';
import { Divider } from '@tremor/react';
import { AxiosError } from 'axios';
import { getEnums } from '../../../../client-api/enums/enum-queries';
import { LoadingSpinner } from '../../../../components/loading-screen';
import { CalanderInput } from '../../../../components/forms/formik/date-pickers';
import {
  FloatingSelect,
  SearchableEmployeeSelect,
  SearchableUserSelect
} from '../../../../components/forms/formik/selects';
import { paymentMethodTypeEnumMap, serviceTypeEnumMap } from '../../../../types/enums';
import { FloatingLabelInput, ServiceDurationInput } from '../../../../components/forms/formik/inputs';
import { TextBoxInput } from '../../../../components/forms/formik/textbox/input';
import DeleteTransaction from '../delete-transaction';
import { useUser } from '@clerk/nextjs';
import { fetchVisits, patchVisit } from '../../../../client-api/visits/visit-queries';
import { Customer } from '@prisma/client';




const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
  visitDate: Yup.date().required('Visit Date is Required'),
  transactions: Yup.array()
    .of(Yup.object().shape({
      serviceType: Yup.string().required('Service Type is required'),
      serviceDuration: Yup.number().required('Service Duration is Required'),
      totalServicePrice: Yup.number().required('Total Service Price is required'),
      actualPaymentCollected: Yup.number().required('Actual Payment Collected is required'),
      discountedServicePrice: Yup.number().required('Discounted Service Price is required'),
      tip: Yup.number()
        .when('serviceType', {
          is: (serviceType: string) => serviceType !== 'Package',
          then: (schema) => schema.required('Tip is required (enter 0 if none)'),
          otherwise: (schema) => schema.optional(),
        }),
      paymentMethod: Yup.string().oneOf(['Venmo', 'Zelle', 'Cash', 'PayPal', 'WeChat', 'CreditCard']).required('Payment Method is required'),
      technicianEmployeeId: Yup.string().required('Technician is required'),
    })),


});

const emptyTransaction = {
  serviceType: undefined,
  serviceDuration: undefined,
  totalServicePrice: undefined,
  actualPaymentCollected: undefined,
  discountedServicePrice: undefined,
  tip: undefined,
  paymentMethod: undefined,
  technicianEmployeeId: undefined,
}

export default function EditVisit() {

  const params = useParams<{visitId: string}>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceTypes: [],
      paymentMethodTypes: []
    }
  });
  const { user } = useUser()

  const { is_admin } = user ? user.publicMetadata : { is_admin: false}
  const { data: visit, isLoading: isVisitLoading, refetch } = useQuery(['visits', params.visitId], () => fetchVisits(params.visitId), {
    onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Transactions: ${error}`,),
  });

  const { mutateAsync } = useMutation(patchVisit, {
    onSuccess: () => {
      setTimeout(() => {
        router.push('/transactions')
      }, 1500)
    },
  });
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

  }, []);



  if (isLoading) return  <LoadingSpinner />

  return (

    <Card title="Edit Visit">
      <Formik
        initialValues={{
          ...visit
        }}
        validationSchema={validationSchema} // Add the validation schema to Formik
        onSubmit={async (values, { setSubmitting }) => {
          try {

            const visitPayload = {
              ...values,
              visitId: params.visitId
            }


            toast.promise(mutateAsync(visitPayload), {
              loading: 'Updating Visit...',
              success: (data: any) => {
                setSubmitting(false);
                return `Visit has been updated`;
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
              name='visitDate'
              as={CalanderInput}
              placeholder='Date'
              type='text'
              className='max-h-[50px] w-[22rem]'
              showIcon
              showButtonBar
              iconPos='left'
              setFieldValue={setFieldValue}
              value={new Date(values.visitDate)}

            />
            <Field
              width='w-[22rem]'
              name='customerId'
              setSelectedCustomer={setSelectedCustomer}
              initValue={visit.customer}
              as={SearchableUserSelect}
              placeholder='Customer Search'
              setFieldValue={setFieldValue}
            />
            <Divider />
            <FieldArray name="transactions">
              {({ insert, remove, push }) => ( <>
                  {values.transactions.length > 0 &&
                    values.transactions.map((transaction, index) => {
                      const clear = (name: string, clearEmployeeSelect: () => void) => {
                        if (name === `transactions.${index}.technicianEmployeeId`) {
                          clearEmployeeSelect()
                        }

                      }
                      return (
                        <div key={index} className='flex flex-wrap gap-x-2 my-7 gap-y-8 relative'>
                          { values.transactions.length > 1 && <button onClick={async () => {
                            await setFieldValue(`transactions.${index}.technicianEmployeeId`, 'clear');
                            remove(index);
                          }} type='button' className='absolute right-0 top-0'>
                            <i className='pi pi-times-circle' style={{ fontSize: '2rem' }}></i>
                          </button>}
                          <div className='col-span-3 w-[100%] font-bold'>
                            <h1>Transaction: {index + 1}</h1>
                          </div>
                          <Field
                            id='cy-technician-search-select'
                            width='w-[22rem]'
                            name={`transactions.${index}.technicianEmployeeId`}
                            initValue={transaction.employee}
                            as={SearchableEmployeeSelect}
                            clear={clear}
                            placeholder='Technician Search'
                            setFieldValue={setFieldValue}
                            className='w-[22rem]' />

                          <Field
                            width='w-[22rem]'
                            name={`transactions.${index}.serviceType`}
                            as={FloatingSelect}
                            setFieldValue={setFieldValue}
                            placeholder='Service Type'
                            initValue={{
                              name: serviceTypeEnumMap.get(transaction.serviceType),
                              code: transaction.serviceType
                            }}
                            filter
                            type='text'
                            options={enums.serviceTypes}
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.serviceDuration`}
                            as={ServiceDurationInput}
                            placeholder='Service Duration'
                            type='text'
                            className='w-[22rem]' />

                          <Field
                            width='w-[22rem]'
                            name={`transactions.${index}.paymentMethod`}
                            as={FloatingSelect}
                            setFieldValue={setFieldValue}
                            placeholder='Payment Method'
                            options={enums.paymentMethodTypes}
                            initValue={{
                              name: paymentMethodTypeEnumMap.get(transaction.paymentMethod),
                              code: transaction.paymentMethod
                            }}
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.totalServicePrice`}
                            as={FloatingLabelInput}
                            placeholder='Total Service Price'
                            type='number'
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.discountedServicePrice`}
                            as={FloatingLabelInput}
                            placeholder='Discounted Service Price'
                            type='number'
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.actualPaymentCollected`}
                            as={FloatingLabelInput}
                            placeholder='Actual Payment Collected'
                            type='number'
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.tip`}
                            as={FloatingLabelInput}
                            placeholder='Tip'
                            type='number'
                            className='w-[22rem]' />

                          <Field
                            setFieldValue={setFieldValue}
                            name={`transactions.${index}.notes`}
                            as={TextBoxInput}
                            placeholder='Additional Notes'
                            width='w-full'
                          />
                        </div>

                      );
                    })}

                  <div className='flex justify-start w-[100%] font-bold'>
                    <Button type='button' label='Add Transaction' icon='pi pi-check' onClick={() => push(emptyTransaction)} />
                  </div>


                </>
              )}
            </FieldArray>
            <Divider />
            <div className='flex w-full justify-end'>
              <Button type='submit' label='Submit' icon='pi pi-check' disabled={isSubmitting} />
            </div>
          </Form>
        )}
      </Formik>

      <Toaster richColors position='top-right' />
      {(visit && is_admin) && <DeleteTransaction transaction={visit} />}

    </Card>


  );
}
