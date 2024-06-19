import React, { useState } from 'react';
import { Formik, Form, Field, yupToFormErrors, validateYupSchema, FieldArray } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FloatingLabelInput, ServiceDurationInput } from '../formik/inputs';
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
import { Divider } from 'primereact/divider';

const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
  visitDate: Yup.date().required('Visit Date is Required'),
  transactions: Yup.array()
    .of(Yup.object().shape({
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
      paymentMethod: Yup.string().required('Payment Method is required'),
      technicianEmployeeId: Yup.string().required('Technician is required'),
    })),

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

const emptyTransaction = {
  serviceType: undefined,
  serviceDuration: undefined,
  totalServicePrice: undefined,
  actualPaymentCollected: undefined,
  discountedServicePrice: undefined,
  tip: undefined,
  paymentMethod: undefined,
  technicianEmployeeId: undefined,
}

const CreateTransactionDialog = ({ refetchTransactions }: any) => {
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
        label='Create Visit'
        icon='pi pi-plus'
        onClick={() => setShowDialog(true)}
        id='cy-create-visit-btn'
      />
      <Toaster richColors position='top-right' />

      <Dialog
        header='Create Visit'
        visible={showDialog}
        className='md:w-[90vw] w-[80vw]'
        modal
        onHide={() => setShowDialog(false)}
      >
        <Formik
          initialValues={{
            userEnteredDate: undefined,
            customerId: undefined,
            cashbackBalanceToUse: 0,
            transactions: [{
              serviceType: undefined,
              serviceDuration: undefined,
              totalServicePrice: undefined,
              actualPaymentCollected: undefined,
              discountedServicePrice: undefined,
              tip: undefined,
              paymentMethod: undefined,
              technicianEmployeeId: undefined,
            }]
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
          onSubmit={async (values, { setSubmitting }) => {
            try {

              toast.promise(mutateAsync(values), {
                loading: 'Creating Visit...',
                success: (data: any) => {
                  setSubmitting(false);
                  setSelectedCustomer(null);
                  return `Visit has been created`;
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
              <div className='flex gap-x-2'>
              <Field
                name='visitDate'
                as={CalanderInput}
                placeholder='Visit Date'
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
              </div>
              <Divider />
              <FieldArray name="transactions">
                {({ insert, remove, push }) => ( <>
                  {values.transactions.length > 0 &&
                    values.transactions.map((transaction, index) => {
                      const clear = (name: string, clearEmployeeSelect: () => void) => {
                        if (name === `transactions.${index}.technicianEmployeeId`) {
                          clearEmployeeSelect()
                        }

                      }
                      return (
                        <div key={index} className='flex flex-wrap gap-x-2 my-7 gap-y-8 relative'>
                          { values.transactions.length > 1 && <button onClick={async () => {
                            await setFieldValue(`transactions.${index}.technicianEmployeeId`, 'clear');
                            remove(index);
                          }} type='button' className='absolute right-0 top-0'>
                            <i className='pi pi-times-circle' style={{ fontSize: '2rem' }}></i>
                          </button>}
                          <div className='col-span-3 w-[100%] font-bold'>
                            <h1>Transaction: {index + 1}</h1>
                          </div>
                          <Field
                            id='cy-technician-search-select'
                            width='w-[22rem]'
                            name={`transactions.${index}.technicianEmployeeId`}
                            as={SearchableEmployeeSelect}
                            clear={clear}
                            placeholder='Technician Search'
                            setFieldValue={setFieldValue}
                            className='w-[22rem]' />

                          <Field
                            width='w-[22rem]'
                            name={`transactions.${index}.serviceType`}
                            as={FloatingSelect}
                            setFieldValue={setFieldValue}
                            placeholder='Service Type'
                            filter
                            type='text'
                            options={enums.serviceTypes}
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.serviceDuration`}
                            as={ServiceDurationInput}
                            placeholder='Service Duration'
                            type='text'
                            className='w-[22rem]' />

                          <Field
                            width='w-[22rem]'
                            name={`transactions.${index}.paymentMethod`}
                            as={FloatingSelect}
                            setFieldValue={setFieldValue}
                            placeholder='Payment Method'
                            options={enums.paymentMethodTypes}
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.totalServicePrice`}
                            as={FloatingLabelInput}
                            placeholder='Total Service Price'
                            type='number'
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.discountedServicePrice`}
                            as={FloatingLabelInput}
                            placeholder='Discounted Service Price'
                            type='number'
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.actualPaymentCollected`}
                            as={FloatingLabelInput}
                            placeholder='Actual Payment Collected'
                            type='number'
                            className='w-[22rem]' />

                          <Field
                            name={`transactions.${index}.tip`}
                            as={FloatingLabelInput}
                            placeholder='Tip'
                            type='number'
                            className='w-[22rem]' />

                          <Field
                            setFieldValue={setFieldValue}
                            name={`transactions.${index}.notes`}
                            as={TextBoxInput}
                            placeholder='Additional Notes'
                            width='w-full'
                          />
                        </div>

                      );
                    })}

                {selectedCustomer ? (
                  <div className='flex justify-end w-[100%]'>
                      <Field
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

                <div className='flex justify-start w-[100%] font-bold'>
                  <Button type='button' label='Add Transaction' icon='pi pi-check' onClick={() => push(emptyTransaction)} />
                </div>


                  </>
                )}
              </FieldArray>
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
