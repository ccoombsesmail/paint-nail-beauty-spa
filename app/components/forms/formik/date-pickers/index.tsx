
import React, { useCallback, useRef } from 'react';
import { useField } from 'formik';
import { Calendar } from "primereact/calendar";

export function CalanderInput(props: any) {
  const calRef = useRef(null);

  const handleClose = useCallback(() => {
    // @ts-ignore
    calRef?.current?.hide();
  }, [calRef]);

  const footerTemplate = useCallback((e: any, setFieldValue: (key: string, value: Date | null) => void) => {
    const handleOKClick = () => {
      setFieldValue(e.name, null);
      handleClose();
    };
    const handleNowClick = () => {
      setFieldValue(e.name, new Date());
      handleClose();
    };
    return (
      <div className='p-datepicker-buttonbar' data-pc-section='buttonbar'>
        <button onClick={handleNowClick} aria-label='Now'
                className='p-button-secondary p-button-text p-button p-component' type='button'
                data-pc-name='button' data-pc-section='root'>
          <span className='p-button-label p-c' data-pc-section='label'>Now</span>
        </button>
        <button onClick={handleOKClick} aria-label='Clear'
                className='p-button-secondary p-button-text p-button p-component' type='button' data-pc-name='button'
                data-pc-section='root'>
          <span className='p-button-label p-c' data-pc-section='label'>Clear</span>
        </button>
      </div>
    );
  }, [handleClose]);

  const [field, meta, helpers] = useField(props);

  const isFormFieldInvalid = () => !!(meta.touched && meta.error);
  return (
    <div>
          <Calendar
            ref={calRef}
            id={props.name}
            name={props.name}
            value={props.value}
            placeholder={props.placeholder || 'Date'}
            className={`max-h-[50px] w-[22rem] ${isFormFieldInvalid() ? 'p-invalid' : ''}`}
            showIcon
            iconPos='left'
            onChange={(e) => {
              props.setFieldValue(props.name, e.target.value);
            }}
            footerTemplate={() => footerTemplate(field, props.setFieldValue)}
          />
      <div>
        {meta.error && meta.touched ? (<span className="text-red-500 ml-2 text-sm">{meta.error}</span>) : null}
      </div>

    </div>
  )
}
