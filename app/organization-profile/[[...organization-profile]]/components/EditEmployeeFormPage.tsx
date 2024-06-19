import CreateEmployeeForm from '../../../components/forms/employee-form';
import React, { memo, useState } from 'react';
import { SearchableEmployeeSelectNonFormik } from '../../../components/forms/formik/selects';
import { Divider } from 'primereact/divider';

const EditEmployeeFormPage = ({ fetchedRoles }: { fetchedRoles: any[] }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  return (
    <div className='w-full'>
      <h1 className='cl-headerTitle font-bold'>Edit Employees</h1>

      <Divider className='mb-10' />

      <SearchableEmployeeSelectNonFormik setSelectedEmployee={setSelectedEmployee} placeholder="Search For Employee To Edit" width="w-[30vw]" />
      { selectedEmployee && <CreateEmployeeForm fetchedRoles={fetchedRoles} isEdit selectedEmployee={selectedEmployee} />}
    </div>
  );
};


export default memo(EditEmployeeFormPage)
