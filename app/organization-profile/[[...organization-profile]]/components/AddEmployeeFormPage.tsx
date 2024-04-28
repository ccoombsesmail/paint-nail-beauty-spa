import CreateEmployeeForm from '../../../components/forms/employee-form';
import React, { memo } from 'react';
import { Divider } from 'primereact/divider';

const AddEmployeeFormPage = ({ fetchedRoles }: { fetchedRoles: any[] }) => {
  return (
    <div className='w-full'>
      <h1 className='cl-headerTitle font-bold'>Create Employee</h1>

      <Divider className='mb-10' />
      <CreateEmployeeForm fetchedRoles={fetchedRoles} />
    </div>
  );
};


export default memo(AddEmployeeFormPage)
