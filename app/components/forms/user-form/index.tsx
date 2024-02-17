import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, useField } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FloatingLabelInput, PhoneInput } from '../formik/inputs';
import { Divider } from '@tremor/react';
import * as Yup from 'yup';
import { CountryCodeDropdown, FloatingSelect, selectedMembershipTemplate } from '../formik/selects';



const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone Number is required'),
  dialCode: Yup.string().required('Country Code is required'),
  membershipLevel: Yup.string().oneOf(["Gold", "Silver", "Bronze", "NonMember" ]).required("Membership Level Is Required")
});

const CreateUserDialog = ({ refetchUsers }: { refetchUsers: () => Promise<void>}) => {
  const [countryCodes, setCountryCodes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState()
  const [enums, setEnums] = useState({
    membershipLevel: [],
    serviceType: []
  })
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



console.log(enums)

  return (
    <>
      <Button style={{backgroundColor: 'var(--pink-400)'}} label="Create User" icon="pi pi-plus" onClick={() => setShowDialog(true)} />

      <Dialog header="Create User"  visible={showDialog} style={{ width: '50vw' }} modal onHide={() => setShowDialog(false)}>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            dialCode: '',
            membershipLevel: ''
          }}
          validationSchema={validationSchema} // Add the validation schema to Formik
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
              })
              const jsonRes = await res.json()
              await refetchUsers()
              console.log('Success:', jsonRes);
            } catch (error) {
              console.error('Error:', error);
            }


            setSubmitting(false);
            setShowDialog(false);
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
              <Field setFieldValue={setFieldValue} name="membershipLevel" as={FloatingSelect} placeholder="Membership Level" options={enums.membershipLevel} valueTemplate={selectedMembershipTemplate} />
              <Divider />
              <div className="flex w-full justify-end">
                <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowDialog(false)} />
                <Button type="submit" label="Submit" icon="pi pi-check" disabled={isSubmitting} loading={isSubmitting} />
              </div>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default CreateUserDialog;
