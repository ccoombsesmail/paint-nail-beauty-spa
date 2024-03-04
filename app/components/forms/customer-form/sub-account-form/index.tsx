import React, { useState } from 'react';
import { Formik, Field } from 'formik';
import { Button } from 'primereact/button';
import { FloatingLabelInput, PhoneInput } from '../../formik/inputs';
import { Divider } from '@tremor/react';
import * as Yup from 'yup';
import {
  CountryCodeDropdown,
  FloatingSelect,
  selectedMembershipTemplate,
  selectedServiceCategoryTemplate
} from '../../formik/selects';


const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone Number is required'),
  dialCode: Yup.string().required('Country Code is required'),
  membershipLevel: Yup.string().required('Membership Level Is Required')
});

// @ts-ignore
const SubAccountForm = ({ setFieldValue, countryCodes }) => {

  return (
    <div className='flex flex-col'>
      <h1 className='text-2xl'>Sub Account Information</h1>
      <div className='flex flex-wrap gap-x-2 my-7 gap-y-8 '>

        <Field name='subAccountInfo.firstName' as={FloatingLabelInput} placeholder='First Name' type='text' />
        <Field name='subAccountInfo.lastName' as={FloatingLabelInput} placeholder='Last Name' type='text' />
        <Field name='subAccountInfo.email' as={FloatingLabelInput} placeholder='Email' type='email' />
        <div className='flex gap-x-2'>
          <Field
            setFieldValue={setFieldValue}
            name='subAccountInfo.dialCode'
            as={CountryCodeDropdown}
            placeholder='Dial Code'
            options={countryCodes}
            optionLabel='dialCode'
            optionValue='dialCode' />
          <Field name='subAccountInfo.phoneNumber' as={PhoneInput} placeholder='Phone Number' />
        </div>
      </div>
    </div>
  );
};

export default SubAccountForm;
