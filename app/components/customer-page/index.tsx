"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { LoadingSpinner } from '../loading-screen';
import { useParams } from 'next/navigation';
import { Field, Form, Formik } from 'formik';
import { FloatingLabelInput, PhoneInput } from '../forms/formik/inputs';
import { CountryCodeDropdown, FloatingSelect, selectedMembershipTemplate } from '../forms/formik/selects';
import { Button } from 'primereact/button';
import * as Yup from 'yup';
import { Card } from 'primereact/card';
import MembershipUpdate from './membership-update';
import { Divider } from 'primereact/divider';
import { ToastContainer } from 'react-toastify';
import { Customer } from '@prisma/client';


const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone Number is required'),
  dialCode: Yup.string().required('Country Code is required'),
  membershipLevel: Yup.string().oneOf(["Gold", "Silver", "Bronze", "NonMember" ]).required("Membership Level Is Required")
});
export default function CustomerProfilePage() {

  const params = useParams<{customerId: string}>()
  const [isLoading, setIsLoading] = useState(true)
  const [countryCodes, setCountryCodes] = useState([]);
  const [enums, setEnums] = useState({
    membershipLevel: [],
    serviceType: []
  })

  const [customer, setCustomer] = useState<Customer>()

  const fetchCustomer = useCallback(async () => {
    try {
      const response = await fetch(`/api/customers/${params.customerId}`);
      const data = await response.json();
      setCustomer(data?.customer || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [params.customerId])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

  }, []);

  useEffect(() => {
    const loadCountryCodes = async () => {
      const resp = await fetch(`/api/country-codes`)
      const data = await resp.json()
      setCountryCodes(data.countryCodes);
    };

    const loadEnums = async () => {
      const resp = await fetch(`/api/enums`)
      const data = await resp.json()
      setEnums(data.enums);
    }

    loadEnums();
    loadCountryCodes()
  }, []);


  if (isLoading) return  <LoadingSpinner />



  return (

    <Card title="Edit Customer Profile">
        <Formik
        initialValues={{
          ...customer
        }}
        validationSchema={validationSchema} // Add the validation schema to Formik
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const res = await fetch('/api/customers', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(values),
            })
            const jsonRes = await res.json()
            await fetchCustomer()
            console.log('Success:', jsonRes);
          } catch (error) {
            console.error('Error:', error);
          }

          setSubmitting(false);
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="flex flex-wrap gap-x-2 my-7 gap-y-8 " >
            <Field name="firstName" as={FloatingLabelInput} placeholder="First Name" type="text" />
            <Field name="lastName" as={FloatingLabelInput} placeholder="Last Name"  type="text" />
            <Field name="email" as={FloatingLabelInput} placeholder="Email" type="email" />
            <div className="flex gap-x-2">
              <Field setFieldValue={setFieldValue} name="dialCode" as={CountryCodeDropdown} placeholder="Dial Code" options={countryCodes} optionLabel="dialCode" optionValue="dialCode" />
              <Field name="phoneNumber" as={PhoneInput} placeholder="Phone Number" />
            </div>
            <Field className="hidden" disabled setFieldValue={setFieldValue} name="membershipLevel" as={FloatingSelect} placeholder="Membership Level" options={enums.membershipLevel} valueTemplate={selectedMembershipTemplate} />

            <div className="flex w-full justify-end">
              <Button type="submit" label="Update Customer Info" icon="pi pi-check" disabled={isSubmitting} loading={isSubmitting} />
            </div>
          </Form>
        )}
      </Formik>

        <Divider className="my-12" />

        {customer && <MembershipUpdate customer={customer}  />}
        <ToastContainer hideProgressBar={true} />

      </Card>


  );
}
