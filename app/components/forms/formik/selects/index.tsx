
import { useField } from 'formik';
import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';



export const selectedMembershipTemplate = (option: {name: string, code: string}) => {
  if (option) {
    return (
      <div className="flex align-items-center" >
        <div>{option.name}</div>
      </div>
    );
  }

  return <span>Select Membership</span>;
};


export const FloatingSelect = (props: any) => {
  const [field, meta, helpers] = useField(props);

  const [option, setOption] = useState(null);

  const onChange = (e: any) => {
    props.setFieldValue(props.name, e.value.code)
    setOption(e.value)
  }

  return (
    <div>
      <span className={`p-float-label ${props.className}`}>
       <Dropdown {...props}  valueTemplate={props.valueTemplate} value={option} onChange={onChange} options={props.options} optionLabel="name"
                 placeholder={props.placeholder} className={`w-[14rem]`} />
           <label htmlFor={props.name}>{props.placeholder}</label>
        </span>

      {meta.error && meta.touched ? (<span className="text-red-500 ml-2 text-sm">{meta.error}</span>) : null}
    </div>

  )
}


// @ts-ignore
export const CountryCodeDropdown = ({ options, setFieldValue, ...rest }) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState()
  // @ts-ignore
  const [field, meta, helpers] = useField(rest);

  const selectedCountryTemplate = (option: {name: string, code: string, emoji: string, dialCode: string}) => {
    if (option) {
      return (
        <div className="flex align-items-center" >
          <img alt={option.emoji} style={{ width: '18px' }} className="mr-1" src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${option.code}.svg`} />
          <div>{option.dialCode}</div>
        </div>
      );
    }

    return <span>Country Code</span>;
  };
  const countryOptionTemplate = (option: {name: string, code: string, emoji: string}) => {
    return (
      <div className="flex align-items-center">
        <img alt={option.emoji} style={{ width: '18px' }} className="mr-1" src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${option.code}.svg`} />
        <div>{option.name}</div>
      </div>
    );
  };
  return (
    <div className='flex flex-col'>
      <Dropdown
        style={{maxHeight: '50px'}}
        {...rest}
        value={selectedCountryCode}
        onChange={(e) => {
          console.log(e.value)
          setFieldValue(rest.name, e.value, true)
          setSelectedCountryCode(e.value);
        }}
        options={options}
        optionLabel='name'
        placeholder='Country Code'
        itemTemplate={countryOptionTemplate}
        valueTemplate={selectedCountryTemplate}
      />
      {meta.error && meta.touched ? (<span className="text-red-500 ml-2 text-sm">{meta.error}</span>) : null}
    </div>

  );
}
