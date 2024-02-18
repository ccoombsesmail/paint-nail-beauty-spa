import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { useField } from 'formik';


export const FloatingLabelInput = (props: any) => {
  const [field, meta, helpers] = useField(props);

  return (
    <div>
      <span className="p-float-label">
      <InputText id={props.name} {...props} />
         <label htmlFor={props.name}>{props.placeholder}</label>
      </span>

      {meta.error && meta.touched ? (<span className="text-red-500 ml-2 text-sm">{meta.error}</span>) : null}
    </div>

  )
}

export const ServiceDurationInput = (props: any) => {
  const [field, meta, helpers] = useField(props);

  return (
    <div>

      <div className="p-inputgroup flex-1">
        <InputText id={props.name} {...props} />
        <span className="p-inputgroup-addon">Hrs</span>
      </div>

      {meta.error && meta.touched ? (<span className="text-red-500 ml-2 text-sm">{meta.error}</span>) : null}
    </div>

  )
}

export const PhoneInput = (props: any) => {
  const [field, meta, helpers] = useField(props);

  return (
    <div>
      <span className="p-float-label">
        <InputMask id="phone_input" mask="(999) 999-9999" placeholder="(999) 999-9999"  {...props}   />
        <label htmlFor="phone_input">Phone Number</label>
      </span>
      {meta.error && meta.touched ? (<span className="text-red-500 ml-2 text-sm">{meta.error}</span>) : null}
    </div>

  )
}
