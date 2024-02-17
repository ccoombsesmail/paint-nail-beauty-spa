import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FloatingLabelInput } from '../formik/inputs';
import { Divider } from '@tremor/react';
import * as Yup from 'yup';
import { FloatingSelect } from '../formik/selects';

const validationSchema = Yup.object().shape({
  serviceType: Yup.string().required('Service Type is required'),
  serviceDuration: Yup.string().required('Service Duration is Required'),
  totalServicePrice: Yup.number().required('Total Service Price is required'),
  actualPaymentCollected: Yup.number().required('Actual Payment Collected'),
  tip: Yup.number(),
  paymentMethod: Yup.string().oneOf(["Venmo", "Zelle", "Cash" ]).required('Payment Method is required'),
  technician: Yup.string().required('Technician is required')
});

// @ts-ignore

const CreateTransactionDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(null)
  useEffect(() => {
    const loadPaymentMethods = async () => {
      const resp = await fetch(`/api/country-codes`)
      const data = await resp.json()
      setPaymentMethods(data.countryCodes);
    };

    loadPaymentMethods();
  }, []);





  return (
    <>
      <Button style={{backgroundColor: 'var(--pink-400)'}} label="Create Transaction" icon="pi pi-plus" onClick={() => setShowDialog(true)} />

      <Dialog header="Create Transaction"  visible={showDialog} style={{ width: '50vw' }} modal onHide={() => setShowDialog(false)}>
        {/*<Search placeholder="Search for User" />*/}
        <Formik
          initialValues={{
            serviceType: '',
            serviceDuration: '',
            amount: 0,
            paymentMethod: '',
            technician: ''
          }}
          validationSchema={validationSchema} // Add the validation schema to Formik
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
              })
              const jsonRes = await res.json()
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
              <Field name="transactionDate" as={FloatingSelect} placeholder="Date" type="text" />
              <Field name="serviceType" as={FloatingSelect} placeholder="Service Type" type="text" />
              <Field name="serviceDuration" as={FloatingLabelInput} placeholder="Service Duration"  type="text" />
              <Field name="totalServicePrice" as={FloatingLabelInput} placeholder="Total Service Price" type="number" />
              <Field name="actualPaymentCollected" as={FloatingLabelInput} placeholder="Actual Payment Collected " type="number" />
              <Field name="tip" as={FloatingLabelInput} placeholder="Tip" type="number" />
              <Field name="paymentMethod" as={FloatingSelect}  setFieldValue={setFieldValue} placeholder="Payment Method" options={[{name: "Venmo", code: "venmo"}]} optionLabel="dialCode" optionValue="dialCode" />
              <Field name="technician" as={FloatingSelect} placeholder="Technician" />
              <Divider />
              <div className="flex w-full justify-end">
                <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowDialog(false)} />
                <Button type="submit" label="Submit" icon="pi pi-check" disabled={isSubmitting} />
              </div>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default CreateTransactionDialog;
