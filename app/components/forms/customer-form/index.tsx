import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FloatingLabelInput, PhoneInput } from '../formik/inputs';
import { Divider } from '@tremor/react';
import * as Yup from 'yup';
import {
  CountryCodeDropdown,
  FloatingSelect,
  selectedMembershipTemplate,
  selectedServiceCategoryTemplate
} from '../formik/selects';
import { useMutation, useQuery } from 'react-query';
import { createCustomer } from '../../../client-api/cutomers/customer-queries';
import { AxiosError } from 'axios';
import { fetchCountryCodes, getEnums } from '../../../client-api/enums/enum-queries';
import { Toaster, toast } from 'sonner';
import SubAccountForm from './sub-account-form';


const validationSchema = Yup.object().shape({
  firstName: Yup.string().when('membershipLevel', {
    is: (membershipLevel: string) => membershipLevel === 'NonMember',
    then: (schema) => schema.nullable(), // No validation rule
    otherwise: (schema) => schema.required('First Name is required'), // Required if condition is not met
  }),
  email: Yup.string().when('membershipLevel', {
    is: (membershipLevel: string) => membershipLevel === 'NonMember',
    then: (schema) => schema.email('Invalid email'), // Only validate the format if provided
    otherwise: (schema) => schema.email('Invalid email').required('Email is required'), // Required and format validation
  }),
  phoneNumber: Yup.string().required('Phone Number is required'),
  dialCode: Yup.string().required('Country Code is required'),
  membershipLevel: Yup.string().required('Membership Level Is Required')
});

const CreateCustomerDialog = ({ refetchCustomers }: { refetchCustomers: () => Promise<any> }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showSubAccountForm, setShowSubAccountForm] = useState(false);
  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceType: [],
      serviceCategoryTypes: []
    }
  });

  const { data: countryCodes } = useQuery('country-codes', fetchCountryCodes, {
    initialData: []
  });

  console.log(countryCodes)
  const { mutateAsync } = useMutation(createCustomer, {
    onSuccess: () => {
      // Refetch customers list to reflect the new customer
      refetchCustomers();
      setShowDialog(false);
    }

  });


  return (
    <>
      <Toaster richColors position='top-right' />

      <Button style={{ backgroundColor: 'var(--pink-400)' }} label='Create Customer' icon='pi pi-plus'
              onClick={() => setShowDialog(true)} />

      <Dialog header='Create Customer' visible={showDialog} style={{ width: '50vw' }} modal
              onHide={() => setShowDialog(false)}>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            dialCode: '',
            membershipLevel: '',
            serviceCategorySelection: undefined,
            subAccountInfo: undefined

          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            console.log(values);
            toast.promise(mutateAsync(values), {
              loading: 'Creating Customer...',
              success: (data: any) => {
                setSubmitting(false);
                return `Customer has been created`;
              },
              error: (data: AxiosError<{ error: string }>) => {
                setSubmitting(false);
                return `${data.response?.data.error}`;
              }
            });


          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className='flex flex-wrap gap-x-2 my-7 gap-y-8 '>
              <Field name='firstName' as={FloatingLabelInput} placeholder='First Name' type='text' />
              <Field name='lastName' as={FloatingLabelInput} placeholder='Last Name' type='text' />
              <Field name='email' as={FloatingLabelInput} placeholder='Email' type='email' />
              <div className='flex gap-x-2'>
                <Field
                  setFieldValue={setFieldValue}
                  name='dialCode'
                  as={CountryCodeDropdown}
                  placeholder='Dial Code'
                  options={countryCodes}
                  optionLabel='dialCode'
                  optionValue='dialCode'
                />
                <Field name='phoneNumber' as={PhoneInput} placeholder='Phone Number' />
              </div>
              <Field
                setFieldValue={setFieldValue}
                name='membershipLevel'
                as={FloatingSelect}
                placeholder='Membership Level'
                options={enums.membershipTypes}
                valueTemplate={selectedMembershipTemplate}
              />
              {
                values.membershipLevel === 'Bronze' || values.membershipLevel === 'BronzeNonActive' ? <Field
                  setFieldValue={setFieldValue}
                  name='serviceCategorySelection'
                  as={FloatingSelect}
                  placeholder='Service Category'
                  options={enums.serviceCategoryTypes}
                  valueTemplate={selectedServiceCategoryTemplate}
                  values={values}
                  disabled={values.membershipLevel !== 'Bronze' && values.membershipLevel !== 'BronzeNonActive'}
                /> : null
              }
              <Divider />

              <div className='flex justify-between w-full'>
                {(values.membershipLevel === 'Silver' || values.membershipLevel === 'Gold') ?
                  (
                    <>
                      {!showSubAccountForm ? <Button
                        label='Add Sub Account'
                        icon='pi pi-plus'
                        className=''
                        onClick={() => setShowSubAccountForm(true)}
                      /> : <div></div>
                      }
                      {showSubAccountForm && <Button
                        label='X'
                        text
                        raised
                        className=''
                        onClick={() => setShowSubAccountForm(false)}
                      />
                      }
                    </>
                  ) : null
                }
              </div>

              {(showSubAccountForm && (values.membershipLevel === 'Silver' || values.membershipLevel === 'Gold')) && <SubAccountForm countryCodes={countryCodes} setFieldValue={setFieldValue} />

              }
              <Divider />
              <div className='flex w-full justify-end'>
                <Button label='Cancel' icon='pi pi-times' className='p-button-text'
                        onClick={() => setShowDialog(false)} />
                <Button type='submit' label='Submit' icon='pi pi-check' disabled={isSubmitting}
                        loading={isSubmitting} />
              </div>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default CreateCustomerDialog;
