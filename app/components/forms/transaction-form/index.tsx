import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FloatingLabelInput, ServiceDurationInput } from '../formik/inputs';
import { Divider } from '@tremor/react';
import * as Yup from 'yup';
import { FloatingSelect, SearchableEmployeeSelect, SearchableUserSelect } from '../formik/selects';
import { useMutation, useQuery } from 'react-query';
import { getEnums } from '../../../client-api/enums/enum-queries';
import { Calendar } from 'primereact/calendar';
import { createTransaction } from '../../../client-api/employees/employee-queries';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

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

// @ts-ignore

const CreateTransactionDialog = ({ refetchTransactions }) => {
  const [showDialog, setShowDialog] = useState(false);

  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceTypes: [],
      paymentMethodTypes: []
    }
  });

  const { mutateAsync } = useMutation(createTransaction, {
    onSuccess: () => {
      // Refetch customers list to reflect the new customer
      refetchTransactions()
      setShowDialog(false);
    },

  });


  return (
    <>
      <Button
        style={{ backgroundColor: 'var(--pink-400)' }}
        label='Create Transaction' icon='pi pi-plus'
        onClick={() => setShowDialog(true)}
      />

      <Dialog
        header='Create Transaction'
        visible={showDialog}
        style={{ width: '50vw' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        {/*<Search placeholder="Search for User" />*/}
        <Formik
          initialValues={{
            userEnteredDate: null,
            serviceType: undefined,
            serviceDuration: null,
            totalServicePrice: null,
            actualPaymentCollected: null,
            tip: null,
            paymentMethod: undefined,
            technicianEmployeeId: null,
            customerId: null
          }}
          validationSchema={validationSchema} // Add the validation schema to Formik
          onSubmit={async (values, { setSubmitting }) => {
            try {
              console.log(values)
              const transactionPayload = {
                ...values,
                serviceDuration: Number(values.serviceDuration)
              }
              console.log(transactionPayload)


              toast.promise(mutateAsync(transactionPayload), {
                loading: 'Creating Transaction...',
                success: (data: any) => {
                  setSubmitting(false);
                  return `Transaction has been created`;
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
            setShowDialog(false);
          }}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className='flex flex-wrap gap-x-2 my-7 gap-y-8 '>
              <Field
                name='userEnteredDate'
                as={Calendar}
                placeholder='Date'
                type='text'
                className='max-h-[50px] w-[17rem]'
                showIcon
                showButtonBar
                showTime
                iconPos='left'
                setFieldValue={setFieldValue}

              />
              <Field
                width='w-[17rem]'
                name='customerId'
                as={SearchableUserSelect}
                placeholder='Customer Search'
                setFieldValue={setFieldValue}
              />

              <Field
                width='w-[17rem]'
                name='serviceType'
                as={FloatingSelect}
                setFieldValue={setFieldValue}
                placeholder='Service Type'
                type='text'
                options={enums.serviceTypes}
                className='w-[17rem]'

              />


              <Field
                name='totalServicePrice'
                as={FloatingLabelInput}
                placeholder='Total Service Price'
                type='number'
                className='w-[17rem]'

              />
              <Field
                name='actualPaymentCollected'
                as={FloatingLabelInput}
                placeholder='Actual Payment Collected'
                type='number'
                className='w-[17rem]'


              />
              <Field
                name='serviceDuration'
                as={ServiceDurationInput}
                placeholder='Service Duration'
                type='text'
                className='w-[17rem]'

              />
              <Field
                name='tip'
                as={FloatingLabelInput}
                placeholder='Tip'
                type='number'
                className='w-[17rem]'

              />
              <Field
                width='w-[17rem]'
                name='paymentMethod'
                as={FloatingSelect}
                setFieldValue={setFieldValue}
                placeholder='Payment Method'
                options={enums.paymentMethodTypes}
                className='w-[17rem]'

              />
              <Field
                width='w-[17rem]'
                name='technicianEmployeeId'
                as={SearchableEmployeeSelect}
                placeholder='Technician Search'
                setFieldValue={setFieldValue}
                className='w-[17rem]'


              />
              <Divider />
              <div className='flex w-full justify-end'>
                <Button label='Cancel' icon='pi pi-times' className='p-button-text'
                        onClick={() => setShowDialog(false)} />
                <Button type='submit' label='Submit' icon='pi pi-check' disabled={isSubmitting} />
              </div>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default CreateTransactionDialog;
