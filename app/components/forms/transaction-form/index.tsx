import React, { useState } from 'react';
import { Formik, Form, Field, yupToFormErrors, validateYupSchema } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FloatingLabelInput, ServiceDurationInput } from '../formik/inputs';
import { Divider } from '@tremor/react';
import * as Yup from 'yup';
import { FloatingSelect, SearchableEmployeeSelect, SearchableUserSelect } from '../formik/selects';
import { useMutation, useQuery } from 'react-query';
import { getEnums } from '../../../client-api/enums/enum-queries';
import { createTransaction } from '../../../client-api/employees/employee-queries';
import { toast, Toaster } from 'sonner';
import { AxiosError } from 'axios';
import { Customer } from '@prisma/client';
import { TextBoxInput } from '../formik/textbox/input';
import { CalanderInput } from '../formik/date-pickers';

const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
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
  userEnteredDate: Yup.date().required('Transaction Date is Required'),
  cashbackBalanceToUse: Yup.number()
    .min(0, 'Value must be greater than or equal to 0')
    .test(
      'max-dynamic',
      'Value exceeds the cashback balance',
      function(value) {
        // @ts-ignore
        return value === undefined || value <= this.options.context.cashbackBalance;
      }
    )
    .optional()

});

// @ts-ignore

const CreateTransactionDialog = ({ refetchTransactions }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceTypes: [],
      paymentMethodTypes: []
    }
  });

  const { mutateAsync } = useMutation(createTransaction, {
    onSuccess: () => {
      refetchTransactions();
      setShowDialog(false);
    }

  });



  return (
    <>
      <Button
        style={{ backgroundColor: 'var(--pink-400)' }}
        label='Create Transaction'
        icon='pi pi-plus'
        onClick={() => setShowDialog(true)}
        id='cy-create-transaction-btn'
      />
      <Toaster richColors position='top-right' />

      <Dialog
        header='Create Transaction'
        visible={showDialog}
        className='md:w-[90vw] w-[80vw]'
        modal
        onHide={() => setShowDialog(false)}
      >
        <Formik
          initialValues={{
            userEnteredDate: undefined,
            serviceType: undefined,
            serviceDuration: undefined,
            totalServicePrice: undefined,
            actualPaymentCollected: undefined,
            discountedServicePrice: undefined,
            tip: undefined,
            paymentMethod: undefined,
            technicianEmployeeId: undefined,
            customerId: undefined,
            cashbackBalanceToUse: 0
          }}
          validate={(values) => {
            try {
              validateYupSchema(values, validationSchema, true, { cashbackBalance: selectedCustomer?.cashbackBalance || 0 });
            } catch (err) {
              return yupToFormErrors(err);
            }
            return {};
          }}
          context={{ maxValue: selectedCustomer?.cashbackBalance || 0 }}
          // validationSchema={() => validationSchema.default({ context: { maxValue: selectedCustomer?.cashbackBalance || 0 } })} // Add the validation schema to Formik
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const transactionPayload = {
                ...values,
                serviceDuration: Number(values.serviceDuration),
                tip: values.tip || 0
              };
              toast.promise(mutateAsync(transactionPayload), {
                loading: 'Creating Transaction...',
                success: (data: any) => {
                  setSubmitting(false);
                  setSelectedCustomer(null);
                  return `Transaction has been created`;
                },
                error: (data: AxiosError<{ error: string }>) => {
                  setSubmitting(false);
                  return `${data.response?.data.error}`;
                }
              });

            } catch (error) {
              console.error('Error:', error);
            }


            setSubmitting(false);
            setShowDialog(false);
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className='flex flex-wrap gap-x-2 my-7 gap-y-8'>
              <Field
                name='userEnteredDate'
                as={CalanderInput}
                placeholder='Date'
                type='text'
                className='max-h-[50px] w-[22rem]'
                showIcon
                showButtonBar
                iconPos='left'
                setFieldValue={setFieldValue}
              />
              <Field
                id='cy-customer-search-select'
                width='w-[22rem]'
                name='customerId'
                as={SearchableUserSelect}
                placeholder='Customer Search'
                setFieldValue={setFieldValue}
                setSelectedCustomer={setSelectedCustomer}
              />
              <Field
                id='cy-technician-search-select'
                width='w-[22rem]'
                name='technicianEmployeeId'
                as={SearchableEmployeeSelect}
                placeholder='Technician Search'
                setFieldValue={setFieldValue}
                className='w-[22rem]'
              />
              <Field
                width='w-[22rem]'
                name='serviceType'
                as={FloatingSelect}
                setFieldValue={setFieldValue}
                placeholder='Service Type'
                filter
                type='text'
                options={enums.serviceTypes}
                className='w-[22rem]'

              />

              <Field
                name='serviceDuration'
                as={ServiceDurationInput}
                placeholder='Service Duration'
                type='text'
                className='w-[22rem]'

              />
              <Field
                width='w-[22rem]'
                name='paymentMethod'
                as={FloatingSelect}
                setFieldValue={setFieldValue}
                placeholder='Payment Method'
                options={enums.paymentMethodTypes}
                className='w-[22rem]'
              />
              <Field
                name='totalServicePrice'
                as={FloatingLabelInput}
                placeholder='Total Service Price'
                type='number'
                className='w-[22rem]'
              />
              <Field
                name='discountedServicePrice'
                as={FloatingLabelInput}
                placeholder='Discounted Service Price'
                type='number'
                className='w-[22rem]'
              />
              <Field
                name='actualPaymentCollected'
                as={FloatingLabelInput}
                placeholder='Actual Payment Collected'
                type='number'
                className='w-[22rem]'
              />
              <Field
                name='tip'
                as={FloatingLabelInput}
                placeholder='Tip'
                type='number'
                className='w-[22rem]'
              />

              {selectedCustomer ? (<div className='flex items-center relative'><Field
                    name='cashbackBalanceToUse'
                    as={FloatingLabelInput}
                    placeholder='Cashback Balance To Use'
                    type='number'
                    className='w-[22rem]' />
                    <Button
                      id='cy-available-cashback-balance'
                      type='button'
                      text
                      raised
                      onClick={() => console.log()}
                      className='ml-5 mb-6'>Available
                      Balance: {(Number(selectedCustomer?.cashbackBalance) - values.cashbackBalanceToUse) || 0}
                    </Button>
                  </div>
                )

                : null
              }
              <Field
                // className='col-span-3'
                setFieldValue={setFieldValue}
                name='notes'
                as={TextBoxInput}
                placeholder='Additional Notes'
                width='w-full'
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
