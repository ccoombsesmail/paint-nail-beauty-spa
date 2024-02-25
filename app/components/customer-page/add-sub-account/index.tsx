'use client';

import React, { useMemo } from 'react';

import { Panel } from 'primereact/panel';
import {
  CountryCodeDropdown
} from '../../forms/formik/selects';
import { Button } from 'primereact/button';
import { Customer } from '@prisma/client';
import { Formik, Form, Field } from 'formik';
import { useMutation, useQuery } from 'react-query';
import { addSubAccount } from '../../../client-api/cutomers/customer-queries';
import { AxiosError } from 'axios';
import { toast, Toaster } from 'sonner';
import { FloatingLabelInput, PhoneInput } from '../../forms/formik/inputs';
import * as Yup from 'yup';
import { fetchCountryCodes } from '../../../client-api/enums/enum-queries';
import { silverOrGold } from '../../../types/enums';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone Number is required'),
  dialCode: Yup.string().required('Country Code is required'),
  membershipLevel: Yup.string().required('Membership Level Is Required')
});

export default function AddSubAccount({ customer, refetchCustomer }: { customer: Customer & { subAccount: Customer, parent: Customer }, refetchCustomer: () => Promise<Customer> }) {
  const { data: countryCodes } = useQuery('country-codes', fetchCountryCodes, {
    initialData: []
  });
  const { mutateAsync } = useMutation(addSubAccount, {
    onSuccess: async (data) => {
      const customer = await refetchCustomer();

    }
  });


  const { reason, memberCanAddSubAccount, setReadOnly } = useMemo(() => {
    if (!silverOrGold.includes(customer.membershipLevel)) {
      return { reason: 'Only Activated Gold Or Silver Members Can Add Sub Accounts', memberCanAddSubAccount: false };
    }
    if (customer.subAccount) {
      return { reason: 'Member already has a linked sub account', memberCanAddSubAccount: false, setReadOnly: true };
    }
    if (customer.parent) {
      return { reason: 'Sub account cannot add sub accounts', memberCanAddSubAccount: false };
    }
    return { reason: '', memberCanAddSubAccount: true };
  }, [customer.membershipLevel, customer.parent, customer.subAccount]);

  // @ts-ignore
  const onSubmit = async (values, { setSubmitting }) => {
    toast.promise(mutateAsync({ customerId: customer.id, values }), {
      loading: 'Creating Sub Account...',
      success: (data: any) => {
        setSubmitting(false);
        return `Sub Account Has Been Created And Linked`;
      },
      error: (data: AxiosError<{ error: string }>) => {
        setSubmitting(false);
        return `${data.response?.data.error}`;
      }
    });
  };

  return (

    <Panel header={customer.subAccount ? 'Sub Account Details' : 'Add Sub Account'}>
      <Formik
        initialValues={customer.subAccount ? {
          ...customer.subAccount
        } : {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          dialCode: ''
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          console.log(values);
          toast.promise(mutateAsync({ customerId: customer.id, values }), {
            loading: 'Creating Sub Account...',
            success: (data: any) => {
              setSubmitting(false);
              return `Sub Account Has Been Created And Linked`;
            },
            error: (data: AxiosError<{ error: string }>) => {
              setSubmitting(false);
              return `${data.response?.data.error}`;
            }
          });


        }}
      >
        {({ isSubmitting, setFieldValue, setSubmitting, values }) => (
          <Form className='flex flex-wrap gap-x-2 my-7 gap-y-8 '>
            {memberCanAddSubAccount || setReadOnly ?
              (<>
                  <div className='flex flex-wrap gap-x-2 my-7 gap-y-8 '>

                    <Field name='firstName' as={FloatingLabelInput} placeholder='First Name' type='text'
                           readOnly={setReadOnly} disabled={setReadOnly} />
                    <Field name='lastName' as={FloatingLabelInput} placeholder='Last Name' type='text'
                           readOnly={setReadOnly} disabled={setReadOnly} />
                    <Field name='email' as={FloatingLabelInput} placeholder='Email' type='email' readOnly={setReadOnly}
                           disabled={setReadOnly} />
                    <div className='flex gap-x-2'>
                      <Field
                        setFieldValue={setFieldValue}
                        name='dialCode'
                        as={CountryCodeDropdown}
                        placeholder='Dial Code'
                        options={countryCodes}
                        optionLabel='dialCode'
                        readOnly={setReadOnly} disabled={setReadOnly}
                        optionValue='dialCode' />
                      <Field name='phoneNumber' as={PhoneInput} placeholder='Phone Number' />
                    </div>
                  </div>
                  <div className='flex w-full justify-end'>

                    {!customer.subAccount && (<Button
                      type='submit'
                      label='Add Sub Account'
                      icon='pi pi-check'
                      disabled={isSubmitting || !memberCanAddSubAccount}
                      loading={isSubmitting}
                      onClick={() => onSubmit(values, { setSubmitting })}
                    />)
                    }
                  </div>
                </>
              ) : (
                <span
                  className='flex justify-center p-button p-component p-button-raised p-button-text h-[48px] min-w-[200px] my-6'>
            {reason}
          </span>
              )

            }
          </Form>
        )}
      </Formik>
      <Toaster richColors position='top-right' />

    </Panel>


  );
}
