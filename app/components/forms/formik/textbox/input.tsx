import { useField } from 'formik';
import { InputTextarea } from 'primereact/inputtextarea';



export const TextBoxInput = (props: any) => {
  const [field, meta, helpers] = useField(props);

  return (
    <div className={`relative pb-6 ${props.className} ${props.width}`}>
      <span className='p-float-label'>
      <InputTextarea id={props.name} {...props} className='w-full min-h-[100px]'  />
         <label htmlFor={props.name}>{props.placeholder}</label>
      </span>

      {meta.error && meta.touched ? (<span className='text-red-500 ml-2 text-sm absolute bottom-0'>{meta.error}</span>) : null}
    </div>

  );
};
