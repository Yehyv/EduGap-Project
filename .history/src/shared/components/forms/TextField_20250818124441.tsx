import { Field, ErrorMessage, useField } from "formik";

type TextFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  onlyNumbers?: boolean;
  maxLength?: number;
};

const TextField = ({
  label,
  name,
  type = "text",
  placeholder,
  onlyNumbers = false,
  maxLength,
}: TextFieldProps) => {
  const [, meta] = useField(name);

  const borderColor =
    meta.touched && meta.error ? "border-red-500" : "border-gray-400";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      <Field
        dir="rtl"
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        inputMode={onlyNumbers ? "numeric" : "text"}
        className={`border rounded-lg px-2 py-1.5 border-[#939393] focus:border-tertiary outline-none ${borderColor}`}
        maxLength={maxLength}
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (onlyNumbers) {
            e.currentTarget.value = e.currentTarget.value.replace(
              /[^0-9]/g,
              ""
            );
          }
        }}
      />
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm"
      />
    </div>
  );
};

export default TextField;
