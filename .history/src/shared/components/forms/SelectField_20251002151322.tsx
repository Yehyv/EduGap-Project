import { Field, ErrorMessage, useField } from "formik";

type SelectFieldProps = {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

const SelectField = ({
  label,
  name,
  options,
  placeholder,
}: SelectFieldProps) => {
  const [, meta] = useField(name);

  const borderColor =
    meta.touched && meta.error ? "border-red-500" : "border-gray-400";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>

      <Field
        as="select"
        id={name}
        name={name}
        className={`border rounded-lg px-3 py-2 border-[#939393] focus:border-tertiary outline-none ${borderColor}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Field>

      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm"
      />
    </div>
  );
};

export default SelectField;
