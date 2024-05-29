
import React from 'react';
import { DataTable, DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Column, ColumnEditorOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';
import { Avatar } from 'primereact/avatar';
import { useMutation, useQuery } from 'react-query';
import { toast, Toaster } from 'sonner';
import {
  deleteOrgMember,
  EmployeePostData,
  fetchMembers,
  updateOrgMember
} from '../../../../client-api/organizations/organization-queries';
import { Employee } from '@prisma/client';
import { getEnums } from '../../../../client-api/enums/enum-queries';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import {
  selectedEmploymentStatusTemplate, selectedRoleTemplate,
  selectedServiceCategoryTemplate
} from '../../../../components/forms/formik/selects';
import { Inplace, InplaceContent, InplaceDisplay } from 'primereact/inplace';


export default function MembersTable() {
  const router = useRouter()

  const { isLoaded, organization } = useOrganization();
  const { data: enums } = useQuery('enums', getEnums, {
    initialData: {
      membershipTypes: [],
      serviceTypes: [],
      paymentMethodTypes: [],
      organizationRoleTypes: [],
      employmentStatusTypes: []
    }
  });

  const { mutateAsync: updateMember } = useMutation(updateOrgMember, {
    onSuccess: () => {
      router.push('/organization-profile')

    }

  });

  const { mutateAsync: deleteMember } = useMutation(deleteOrgMember, {
    onSuccess: () => {
      setTimeout(() => {
        router.push('/organization-profile')

      }, 2000)

    }

  });
  const { data: members }  = useQuery(['members'], () => fetchMembers(organization.id!), {
    // onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Customers: ${error}`),
    enabled: !!organization

  });



  if (!isLoaded) {
    return <>Loading</>;
  }

  const getSeverity = (value: string) => {
    switch (value) {
      case 'org:admin':
        return 'info';
      case 'org:employee':
        return 'secondary';
      case 'org:member':
        return 'success';

      default:
        return null;
    }
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    const newData: Employee = e.newData as Employee

    if (organization?.id && newData.firstName && newData.lastName) {
        const data: EmployeePostData = {
          ...newData,
          firstName: newData.firstName,
          lastName: newData.lastName,
          organizationId: organization?.id
        }
      toast.promise(updateMember(data), {
        loading: 'Updating Employee...',
        success: (data: any) => {
          return `Employee Has Been Updated`;
        },
        error: (data: AxiosError<{ error: string; }>) => {
          return `${data.response?.data.error}`;
        },
        duration: 5000
      });
    }
  };

  const onDeleteBtnClick = async (employeeId: string) => {
    toast.promise(deleteMember(employeeId), {
      loading: 'Deleting Employee...',
      success: (data: any) => {
        return `Employee Has Been Deleted`;
      },
      error: (data: AxiosError<{ error: string; }>) => {
        return `${data.response?.data.error}`;
      },
    });
  }
  const textEditor = (options: ColumnEditorOptions, shouldDisable = false) => {
    return <InputText className='min-w-[200px]' disabled={shouldDisable} type="text" value={options.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => options.editorCallback!(e.target.value)} />;
  };

  const phoneEditor = (options: ColumnEditorOptions) => {
    return <InputMask
      className='min-w-[200px]'
      mask="999-999-9999"
      placeholder="999-999-9999"
      type="text"
      value={options.value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => options.editorCallback!(e.target.value)}
    />;
  };

  const textBoxEditor = (options: ColumnEditorOptions) => {
    return <InputTextarea
      className='min-w-[200px]'
      cols={30}
      rows={1}
      type="text"
      value={options.value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => options.editorCallback!(e.target.value)}
    />;
  };

  const roleEditor = (options: ColumnEditorOptions) => {

    return (
      <Dropdown
        // valueTemplate={roleBodyTemplate}
        value={options.value}
        options={enums.organizationRoleTypes.map(({ name }) => name) }
        onChange={(e: DropdownChangeEvent) => {
          options.editorCallback!(e.value);
        }}
        pt={{
          root: {
            className: 'h-[50px]'
          },
        }}

        placeholder="Select a Role"
        valueTemplate={selectedRoleTemplate}
        itemTemplate={(option) => {
          return <div><Tag value={option} severity={getSeverity(option)}></Tag> </div>;
        }}
      />
    );
  };

  const statusEditor = (options: ColumnEditorOptions) => {

    return (
      <Dropdown
        value={options.value}
        pt={{
          root: {
            className: 'h-[50px]'
          },
        }}
        options={enums.employmentStatusTypes.map(({ name }) => name) }
        onChange={(e: DropdownChangeEvent) => {
          options.editorCallback!(e.value);
        }}
        placeholder="Select a Role"

        valueTemplate={selectedEmploymentStatusTemplate}
        itemTemplate={(option) => <div>{option}</div>}
      />
    );
  };

  const deleteBody = (rowData: Employee) => {
    return (
      <Button text label='Delete' onClick={() => onDeleteBtnClick(rowData.userId)} />
    )
  };

  const addressBody = (rowData: Employee) => {
    return (
      <span style={{display: 'flex', whiteSpace: 'nowrap'}} className='text-nowrap'>{rowData.address}</span>
      // <Inplace pt={{
      //   display: {
      //     className: 'text-primary'
      //   }
      // }}>
      //   <InplaceDisplay>Address</InplaceDisplay>
      //   <InplaceContent>
      //     <span style={{display: 'flex', whiteSpace: 'nowrap'}} className='text-nowrap'>{rowData.address}</span>
      //   </InplaceContent>
      // </Inplace>
    )
  };

  const roleBodyTemplate = (rowData: Employee) => {
    if (!rowData) return null
    return <Tag value={rowData.organizationRole} severity={getSeverity(rowData.organizationRole)}></Tag>;
  };

  const avatarBody = (rowData: Employee) => {
    return (
      <Avatar image={rowData.profileImage || ''} shape='circle' size='large' />
    )
  };
  console.log(members)
  return (
    <div className="card p-fluid">
      <Toaster richColors position='top-right' />

      <h1 className='cl-headerTitle font-bold'>Members <span className='bg-gray-300 rounded-2xl px-1'>{members?.length}</span></h1>
      <Divider className='mb-10' />
      <DataTable
        value={members}
        editMode="row"
        dataKey="id"
        sortOrder={-1}
        sortField={"createdAt"}
        onRowEditComplete={onRowEditComplete}
        tableStyle={{ minWidth: '50rem' }}
        className='rounded-3xl'
        pt={{
          wrapper: {
            className: "rounded-2xl border-b-gray-300 border-[1px] max-h-[60vh] "
          },

      }}

      >
        <Column style={{width: '1rem'}} body={avatarBody} field="" header=""></Column>
        <Column rowEditor={true} headerStyle={{ minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
        <Column className='min-w-[200px]' field="firstName" header="First Name" editor={(options) => textEditor(options)} ></Column>
        <Column className='min-w-[200px]' field="lastName" header="Last Name" editor={(options) => textEditor(options)} ></Column>
        <Column field="employmentStatus" header="Status" editor={(options) => statusEditor(options)} ></Column>
        <Column  field="organizationRole" header="Role" body={roleBodyTemplate} editor={(options) => roleEditor(options)}></Column>
        <Column  className='min-w-[200px]' field="phoneNumber" header="Phone" editor={(options) => phoneEditor(options)} ></Column>
        <Column field="email" header="Email" editor={(options) => textEditor(options, true)} ></Column>

        <Column body={addressBody} field="address" header="Address" editor={(options) => textBoxEditor(options)} ></Column>
        <Column body={deleteBody} field="" header="" ></Column>

        {/*<Column field="price" header="Price" body={priceBodyTemplate} editor={(options) => priceEditor(options)} style={{ width: '20%' }}></Column>*/}
      </DataTable>
    </div>
  );
}
