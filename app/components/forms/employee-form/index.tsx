import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Button } from 'primereact/button';
import { FloatingLabelInput, PhoneInput } from '../formik/inputs';
import * as Yup from 'yup';
import {
  CountryCodeDropdown,
  FloatingSelect,
  SearchableEmployeeSelectNonFormik,
  SearchableUserSelectNonFormik, selectedEmploymentStatusTemplate,
  selectedRoleTemplate
} from '../formik/selects';
import { useMutation, useQuery } from 'react-query';
import { AxiosError } from 'axios';
import { fetchCountryCodes, getEnums } from '../../../client-api/enums/enum-queries';
import { Toaster, toast } from 'sonner';
import { TextBoxInput } from '../formik/textbox/input';
import { Divider } from 'primereact/divider';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';
import { createOrgMember, updateOrgMember } from '../../../client-api/organizations/organization-queries';
import { useRouter } from 'next/navigation';


const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name Is Required"),
  lastName: Yup.string().required("Last Name Is Required"),
  email: Yup.string().optional(),
  phoneNumber: Yup.string().optional(),
  organizationRole: Yup.string().required('Role Level Is Required')
});

const CreateEmployeeForm = ({ fetchedRoles, isEdit, selectedEmployee }: any) => {
  const router = useRouter()
  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceType: [],
      serviceCategoryTypes: [],
      employmentStatusTypes: [],
      organizationRoleTypes: [],


    }
  });

  const { userMemberships } = useOrganizationList({
    userMemberships: {
      pageSize: 1,
      initialPage: 1
    }
  });

  const { organization } = useOrganization()


  const { data: countryCodes } = useQuery('country-codes', fetchCountryCodes, {
    initialData: []
  });

  const { mutateAsync: createMember } = useMutation(createOrgMember, {
    onSuccess: () => {
      router.push('/organization-profile')
    }

  });

  const { mutateAsync: updateMember } = useMutation(updateOrgMember, {
    onSuccess: () => {
      router.push('/organization-profile')

    }

  });

  let initRole: {name: string, code: string} | null = null
  let initEmploymentStatus: {name: string, code: string} | null = null
  if (selectedEmployee) {
    const formattedRole = selectedEmployee.organizationRole.split(":")[1]
    initRole= {name: formattedRole, code: selectedEmployee.organizationRole }

    initEmploymentStatus= {name: selectedEmployee.employmentStatus, code: selectedEmployee.employmentStatus }
  }

  return (
    <>
      <Toaster richColors position='top-right' />
        <Formik
          initialValues={ !selectedEmployee ? {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            role: '',
            notes: '',

          } : {
            ...selectedEmployee,
            phoneNumber: selectedEmployee.phoneNumber || ''
            // role: {name: selectedEmployee.role, code: selectedEmployee.role}
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const data = {
              ...values,
              organizationName: organization?.name,
              organizationId: organization?.id,
              organizationSlug: organization?.slug,
              userId: isEdit ? selectedEmployee.userId : undefined
            }
            if (isEdit) {
              toast.promise(updateMember(data), {
                loading: 'Updating Employee...',
                success: (data: any) => {
                  setSubmitting(false);
                  return `Employee Has Been Updated`;
                },
                error: (data: AxiosError<{ error: string }>) => {
                  setSubmitting(false);
                  return `${data.response?.data.error}`;
                }
              });
            }
            else {
              toast.promise(createMember(data), {
                loading: 'Creating Employee...',
                success: (data: any) => {
                  setSubmitting(false);
                  return `Employee has been created`;
                },
                error: (data: AxiosError<{ error: string }>) => {
                  setSubmitting(false);
                  return `${data.response?.data.error}`;
                }
              });
            }


          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className='flex flex-wrap my-7 '>
              <div className='grid grid-cols-3 xl:grid-cols-3 gap-y-4 gap-x-0'>

                <Field name='firstName' as={FloatingLabelInput} placeholder='First Name' type='text'                 className='w-[14rem]' />
                <Field name='lastName' as={FloatingLabelInput} placeholder='Last Name' type='text'   className='w-[14rem]' />
                <Field name='email' as={FloatingLabelInput} placeholder='Email' type='email' readOnly={isEdit} disabled={isEdit}    className='w-[100%] col-span-1' />
                <Field name='phoneNumber' as={PhoneInput} placeholder='Phone Number' nolabel className='w-[14rem]' />
                <Field name='address' as={FloatingLabelInput} placeholder='Address' nolabel className='w-[100%] col-span-2' />

                <Field
                  setFieldValue={setFieldValue}
                  name='organizationRole'
                  initValue={initRole}
                  as={FloatingSelect}
                  placeholder='Role'
                  options={enums.organizationRoleTypes}
                  valueTemplate={selectedRoleTemplate}
                />

                <Field
                  setFieldValue={setFieldValue}
                  name='employmentStatus'
                  initValue={initEmploymentStatus}
                  as={FloatingSelect}
                  placeholder='Employment Status'
                  options={enums.employmentStatusTypes}
                  valueTemplate={selectedEmploymentStatusTemplate}
                />

                <Field
                  className='col-span-2'
                  setFieldValue={setFieldValue}
                  name='notes'
                  as={TextBoxInput}
                  placeholder='Additional Notes'
                  width='w-full'
                />
              </div>

              <Divider />

              <div className='flex w-full justify-end'>
                <Button
                  type='submit'
                  label={ isEdit ? 'Submit' : 'Create Employee'}
                  icon='pi pi-check'
                  disabled={isSubmitting}
                  loading={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
    </>
  );
};

export default CreateEmployeeForm;
