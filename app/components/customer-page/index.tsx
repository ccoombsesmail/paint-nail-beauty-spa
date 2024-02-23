'use client';

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../loading-screen';
import { useParams } from 'next/navigation';
import { Field, Form, Formik } from 'formik';
import { FloatingLabelInput, PhoneInput } from '../forms/formik/inputs';
import { Button } from 'primereact/button';
import * as Yup from 'yup';
import { Card } from 'primereact/card';
import MembershipUpdate from './membership-update';
import { Divider } from 'primereact/divider';
import { useMutation, useQuery } from 'react-query';
import { toast, Toaster } from 'sonner';
import { editCustomer, fetchCustomer } from '../../client-api/cutomers/customer-queries';
import { getEnums } from '../../client-api/enums/enum-queries';
import { AxiosError } from 'axios/index';


const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string().required('Phone Number is required'),
});
export default function CustomerProfilePage() {

  const params = useParams<{ customerId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceTypes: [],
      paymentMethodTypes: []
    }
  });

  const { data: customer, isLoading: isCustomerLoading, refetch } = useQuery(['customer', params.customerId], () => fetchCustomer(params.customerId), {
    onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Transactions: ${error}`)
  });

  const { mutateAsync } = useMutation(editCustomer, {
    onSuccess: () => {
      // Refetch customers list to reflect the new customer
      refetch()
    },
  });
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

  }, []);


  if (isLoading || isCustomerLoading) return <LoadingSpinner />;


  return (

    <Card title='Edit Customer Profile'>
      <Formik
        initialValues={{
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber
        }}
        validationSchema={validationSchema} // Add the validation schema to Formik
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const customerPayload = {
              ...values
            }
            console.log(customerPayload)
            toast.promise(mutateAsync(customerPayload), {
              loading: 'Updating Customer...',
              success: (data: any) => {
                setSubmitting(false);
                return `Customer has been updated`;
              },
              error: (data: AxiosError<{ error: string }>) => {
                setSubmitting(false);
                return `${data.response?.data.error}`;
              },
            });
            await refetch();
          } catch (error) {
            console.error('Error:', error);
          }

          setSubmitting(false);
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className='flex flex-wrap gap-x-2 my-7 gap-y-8 '>
            <Field name='firstName' as={FloatingLabelInput} placeholder='First Name' type='text' />
            <Field name='lastName' as={FloatingLabelInput} placeholder='Last Name' type='text' />
            <Field name='email' as={FloatingLabelInput} placeholder='Email' type='email' />
            <div className='flex gap-x-2'>
              <Field name='phoneNumber' as={PhoneInput} placeholder='Phone Number' />
            </div>
            {/*<Field*/}
            {/*  className='hidden'*/}
            {/*  disabled*/}
            {/*  setFieldValue={setFieldValue}*/}
            {/*  name='membershipLevel'*/}
            {/*  as={FloatingSelect}*/}
            {/*  placeholder='Membership Level'*/}
            {/*  options={enums.membershipLevel}*/}
            {/*  valueTemplate={selectedMembershipTemplate}*/}
            {/*/>*/}

            <div className='flex w-full justify-end'>
              <Button
                type='submit'
                label='Update Customer Info'
                icon='pi pi-check'
                disabled={isSubmitting}
                loading={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>

      <Divider className='my-12' />

      {customer && <MembershipUpdate customer={customer} />}
      <Toaster richColors position='top-right'/>

    </Card>


  );
}
