import { useField } from 'formik';
import React, { useCallback, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useQuery } from 'react-query';
import { fetchCustomers } from '../../../../client-api/cutomers/customer-queries';
import { AutoComplete } from 'primereact/autocomplete';
import { toast } from 'sonner';
import { fetchEmployees } from '../../../../client-api/employees/employee-queries';
import { formatName } from '../../../../utils/format-name';
import { Customer } from '@prisma/client';
import { Button } from 'primereact/button';
import CustomerForm from '../../customer-form';
import { Divider } from 'primereact/divider';


export const selectedMembershipTemplate = (option: { name: string, code: string }) => {
  if (option) {
    return (
      <div className='flex align-items-center'>
        <div>{option.name}</div>
      </div>
    );
  }

  return <span>Select Membership</span>;
};

export const selectedServiceCategoryTemplate = (option: { name: string, code: string }) => {
  if (option) {
    return (
      <div className='flex align-items-center'>
        <div>{option.name}</div>
      </div>
    );
  }

  return <span>Select Category</span>;
};

export const FloatingSelect = (props: any) => {
  const [field, meta, helpers] = useField(props);
  const [option, setOption] = useState(props.initValue || null);

  const onChange = (e: any) => {
    console.log(e.value.code)
    props.setFieldValue(props.name, e.value.code);
    setOption(e.value);
  };

  return (
    <div>
      <span className={`p-float-label ${props.className}`}>
       <Dropdown {...props} valueTemplate={props.valueTemplate} value={option} onChange={onChange}
                 options={props.options} optionLabel='name'
                 placeholder={props.placeholder} className={props.width ? props.width : `w-[14rem]`} />
           <label htmlFor={props.name}>{props.placeholder}</label>
        </span>

      {meta.error && meta.touched ? (<span className='text-red-500 ml-2 text-sm'>{meta.error}</span>) : null}
    </div>

  );
};


// @ts-ignore
export const CountryCodeDropdown = ({ options, setFieldValue, ...rest }) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState();
  // @ts-ignore
  const [field, meta, helpers] = useField(rest);

  const selectedCountryTemplate = (option: { name: string, code: string, emoji: string, dialCode: string }) => {
    if (option) {
      return (
        <div className='flex align-items-center'>
          <img alt={option.emoji} style={{ width: '18px' }} className='mr-1'
               src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${option.code}.svg`} />
          <div>{option.dialCode}</div>
        </div>
      );
    }

    return <span>Country Code</span>;
  };
  const countryOptionTemplate = (option: { name: string, code: string, emoji: string }) => {
    return (
      <div className='flex align-items-center'>
        <img alt={option.emoji} style={{ width: '18px' }} className='mr-1'
             src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${option.code}.svg`} />
        <div>{option.name}</div>
      </div>
    );
  };
  return (
    <div className='flex flex-col'>
      <Dropdown
        style={{ maxHeight: '50px' }}
        {...rest}
        value={selectedCountryCode}
        onChange={(e) => {
          setFieldValue(rest.name, e.value, true);
          setSelectedCountryCode(e.value);
        }}
        options={options}
        optionLabel='name'
        placeholder='Country Code'
        itemTemplate={countryOptionTemplate}
        valueTemplate={selectedCountryTemplate}
      />
      {meta.error && meta.touched ? (<span className='text-red-500 ml-2 text-sm'>{meta.error}</span>) : null}
    </div>

  );
};


const userOptionTemplate = (option: { firstName: string | null, lastName: string | null, phoneNumber: string }) => {
  return (
    <div className='flex items-center justify-between w-full'>
      <div className='font-bold truncate w-36'>{formatName(option)}</div>
      <div>{option.phoneNumber}</div>
    </div>
  );
};

const selectedUserTemplate = (option: { firstName: string, phoneNumber: string }) => {
  if (option) {
    return (
      <div className='flex items-center justify-between'>
        <div className='font-bold mr-4'>{option.firstName}</div>
        <div>{option.phoneNumber}</div>
      </div>
    );
  }

  return <span>Select Membership</span>;
};

export const SearchableUserSelect = (props: any) => {

  const [field, meta, helpers] = useField(props);

  const [selectedUser, setSelectedUser] = useState(props.initValue ? [props.initValue] : null);
  const [search, setSearch] = useState<string[]>([]);
  const { data: users, refetch } = useQuery(['customers', search], () => fetchCustomers(search[0], true), {
    // onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Customers: ${error}`,),
  });


  const onChange = (e: any) => {
    props.setFieldValue(props.name, e.value[0] ? e.value[0].id : null);
    setSelectedUser(e.value);
    props.setSelectedCustomer(e.value[0])
  };

  const onFilter = useCallback(async (e: any) => {
    setSearch([e.query])
    await refetch(e.query)
  }, [refetch])
  return (
    <div className={` ${props.width ? props.width : 'w-[14rem]'}`}>
      <span className={`p-float-label ${props.className}  ${props.width ? props.width : 'w-[14rem]'}`}>
        <AutoComplete
          {...props}
          multiple
          delay={100}
          selectionLimit={1}
          emptyMessage="No Results"
          showEmptyMessage
          value={selectedUser}
          suggestions={users}
          itemTemplate={userOptionTemplate}
          selectedItemTemplate={selectedUserTemplate}
          completeMethod={onFilter}
          forceSelection
          onChange={onChange}
          className={`max-h-[50px] no-input-border  ${props.width ? props.width : 'w-[14rem]'}`}
          pt={{
            input: {
              className: `${props.width ? props.width : 'w-[14rem]'}`
            }

          }}
        />

           <label htmlFor={props.name}>{props.placeholder}</label>
        </span>

      {meta.error && meta.touched ? (<span className='text-red-500 ml-2 text-sm'>{meta.error}</span>) : null}
    </div>

  );
};


export const SearchableEmployeeSelect = (props: any) => {

  const [field, meta, helpers] = useField(props);

  const [selectedUser, setSelectedUser] = useState(props.initValue ? [props.initValue] : null);
  const [search, setSearch] = useState<string[]>([]);
  const { data: users, refetch } = useQuery(['employees', search], () => fetchEmployees(search[0]), {
    // onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Employees: ${error}`,),
  });


  const onChange = (e: any) => {
    console.log(e.value);
    props.setFieldValue(props.name, e.value[0] ? e.value[0].id : null);
    setSelectedUser(e.value);
  };

  const onFilter = useCallback(async (e: any) => {
    setSearch([e.query])
    await refetch(e.query)
  }, [refetch])

  return (
    <div className={` ${props.width ? props.width : 'w-[14rem]'}`}>
      <span className={`p-float-label ${props.className} ${props.width ? props.width : 'w-[14rem]'}`}>
        <AutoComplete
          {...props}
          multiple
          delay={100}
          selectionLimit={1}
          emptyMessage="No Results"
          showEmptyMessage
          value={selectedUser}
          suggestions={users}
          itemTemplate={userOptionTemplate}
          selectedItemTemplate={selectedUserTemplate}
          completeMethod={onFilter}
          forceSelection
          onChange={onChange}
          className={`max-h-[50px] no-input-border  ${props.width ? props.width : 'w-[14rem]'}`}
          pt={{
            input: {
              className: `${props.width ? props.width : 'w-[14rem]'}`
            }

          }}
        />

           <label htmlFor={props.name}>{props.placeholder}</label>
        </span>

      {meta.error && meta.touched ? (<span className='text-red-500 ml-2 text-sm'>{meta.error}</span>) : null}
    </div>

  );
};



export const SearchableUserSelectNonFormik = (props: any) => {


  const [selectedUser, setSelectedUser] = useState( props.initValue ? [props.initValue] : null);
  const [search, setSearch] = useState<string[]>([]);
  const { data: users, refetch } = useQuery(['customers', search], () => fetchCustomers(search[0], false), {
    // onSuccess: (data) => console.log('Data fetched:', data),
    onError: (error) => toast.error(`Error Searching For Customers: ${error}`,),
  });



  const onChange = (e: any) => {
    setSelectedUser(e.value);
    props.setSelectedCustomer(e.value[0])
  };

  const onFilter = useCallback(async (e: any) => {
    setSearch([e.query])
    await refetch(e.query)
  }, [refetch])

  const footerTemplate = () => {
    return (
      <div className='w-full flex flex-col justify-center' onClick={e => e.stopPropagation()}>
        <Divider />
        <CustomerForm refetchCustomers={refetch} />
      </div>
    )
  }
  return (
    <div className={` ${props.width ? props.width : 'w-[14rem]'}`}>
      <span className={`p-float-label ${props.className}  ${props.width ? props.width : 'w-[14rem]'}`}>
        <AutoComplete
          id={props.id}
          multiple
          delay={100}
          selectionLimit={1}
          emptyMessage="No Results (Click Below To Create Customer)"
          showEmptyMessage
          value={selectedUser}
          suggestions={props.fromCustomer ? users?.filter((u: Customer) => u.id !== props.fromCustomer.id) : users}
          itemTemplate={userOptionTemplate}
          selectedItemTemplate={selectedUserTemplate}
          panelFooterTemplate={footerTemplate}
          completeMethod={onFilter}
          forceSelection
          onChange={onChange}
          className={`max-h-[50px] no-input-border  ${props.width ? props.width : 'w-[14rem]'}`}
          disabled={props.disabled}
          pt={{
            input: {
              className: `${props.width ? props.width : 'w-[14rem]'}`
            }

          }}
        />

           <label htmlFor={props.name}>{props.placeholder}</label>
        </span>

    </div>

  );
};
