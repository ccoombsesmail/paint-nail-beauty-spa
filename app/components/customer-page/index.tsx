'use client';

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../loading-screen';
import { useParams, useRouter } from 'next/navigation';
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
import { AxiosError } from 'axios';
import MembershipTransfer from './membership-transfer';
import BalanceTransfer from './balance-transfer';
import AddSubAccount from './add-sub-account';
import { TextBoxInput } from '../forms/formik/textbox/input';
import MembershipDelete from './membership-delete';
import { useUser } from '@clerk/nextjs';
import { FloatingSelect, selectedServiceCategoryTemplate } from '../forms/formik/selects';
import { getEnums } from '../../client-api/enums/enum-queries';
import { $Enums } from '@prisma/client';
import { reversedMembershipTypeEnumMap } from '../../types/enums';


const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string().required('Phone Number is required'),
  serviceCategorySelection: Yup.string().when('membershipLevel', {
    is: (membershipLevel: string) => membershipLevel === 'Bronze',
    then: (schema) => schema.required('Service Category Is Required'),
    otherwise: (schema) => schema.optional().nullable()
  }),
});
export default function CustomerProfilePage({ unlock, masterCode } : { unlock: boolean, masterCode: string}) {
  const router = useRouter()
  const params = useParams<{ customerId: string }>();
  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      serviceCategoryTypes: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser()

  const { is_admin } = user ? user.publicMetadata : { is_admin: false}
  const { data: customer, isLoading: isCustomerLoading, refetch } = useQuery(['customer', params.customerId], () => fetchCustomer(params.customerId), {
    onError: (error) => toast.error(`Error Searching For Customer: ${error}`)
  });

  const { mutateAsync } = useMutation(editCustomer, {
    onSuccess: async () => {
      await refetch()
      router.push('/')
    },
  });
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

  }, []);


  if (isLoading || isCustomerLoading) return <LoadingSpinner />;
  return (

    <Card title='Edit Customer Profile' id='edit-customer-card' className='pb-10'>
      <Formik
        initialValues={{
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          notes: customer.notes,
          membershipLevel: customer.membershipLevel,
          serviceCategorySelection: customer.serviceCategorySelection
        }}
        validationSchema={validationSchema} // Add the validation schema to Formik
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const customerPayload = {
              ...values,
              masterCode
            }
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
        {({ isSubmitting, values, setFieldValue, errors }) => {
          console.log(errors)
          return (

          <Form className='flex flex-wrap gap-x-2 my-7 gap-y-8 '>
            <Field name='firstName' as={FloatingLabelInput} placeholder='First Name' type='text' />
            <Field name='lastName' as={FloatingLabelInput} placeholder='Last Name' type='text' />
            <Field name='email' as={FloatingLabelInput} placeholder='Email' type='email' />
            <div className='flex gap-x-2'>
              <Field name='phoneNumber' as={PhoneInput} placeholder='Phone Number' />
            </div>
            {
              values.membershipLevel === $Enums.Membership.Bronze || values.membershipLevel === $Enums.Membership.BronzeNonActive ? <Field
                setFieldValue={setFieldValue}
                name='serviceCategorySelection'
                as={FloatingSelect}
                initValue={{ name: customer.serviceCategorySelection, code: customer.serviceCategorySelection }}
                placeholder='Service Category'
                options={enums.serviceCategoryTypes}
                valueTemplate={selectedServiceCategoryTemplate}
                values={values}
                // disabled={values.membershipLevel !== 'Bronze' && values.membershipLevel !== 'BronzeNonActive'}
              /> : null
            }
            <Field
              className='col-span-3'
              setFieldValue={setFieldValue}
              name='notes'
              as={TextBoxInput}
              placeholder='Additional Notes'
              width='w-full'
            />

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
        )}}
      </Formik>

      <Divider className='my-12' />

      {/*  @ts-ignore */}
      {customer && <AddSubAccount customer={customer} refetchCustomer={refetch} unlock={unlock} masterCode={masterCode} />}

      <Divider className='my-12' />

      {/*  @ts-ignore */}
      {customer && <MembershipUpdate customer={customer} refetchCustomer={refetch} unlock={unlock}  masterCode={masterCode} />}
      <Divider className='my-12' />

      {/*  @ts-ignore */}
      {customer && <MembershipTransfer customer={customer} refetchCustomer={refetch} unlock={unlock}  masterCode={masterCode} />}
      <Divider className='my-12' />

      {/*  @ts-ignore */}
      {customer && <BalanceTransfer customer={customer} refetchCustomer={refetch} unlock={unlock}   masterCode={masterCode} />}
      <Divider className='my-12' />

      {(customer && is_admin) && <MembershipDelete customer={customer} unlock={unlock}  masterCode={masterCode} />}

      <Toaster richColors position='top-right'/>


    </Card>


  );
}
