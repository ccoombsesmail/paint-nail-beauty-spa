
import React from 'react';
import { useField } from 'formik';
import { Calendar } from "primereact/calendar";
import { classNames } from 'primereact/utils';

export function CalanderInput(props: any) {

  const [field, meta, helpers] = useField(props);

  const isFormFieldInvalid = () => !!(meta.touched && meta.error);

  return (
    <div>
        <span className="p-float-label">
        <Calendar
          id={props.name}
          value={field.value}
          className={classNames({ 'p-invalid': isFormFieldInvalid() })}
          onChange={(e) => {
            props.setFieldValue(props.name, e.target.value);
          }}
          {...props}
        />
          <label htmlFor={props.name}>Birth Date</label>

        </span>
      {meta.error && meta.touched ? (<span className="text-red-500 ml-2 text-sm">{meta.error}</span>) : null}

    </div>
  )
}
