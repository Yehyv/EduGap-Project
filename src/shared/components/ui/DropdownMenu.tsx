// SelectField.tsx
import { useField, useFormikContext } from "formik";
import Select from "react-select";

export default function DropdownMenu({ label, name, options }) {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const currentValue = options.find((opt) => opt.value === field.value) || null;

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-medium">{label}</label>}

      <Select
        value={currentValue}
        onChange={(opt) => setFieldValue(name, opt.value)}
        options={options}
        className="react-select-container"
        classNamePrefix="react-select"
      />

      {meta.touched && meta.error && (
        <span className="text-red-500 text-xs">{meta.error}</span>
      )}
    </div>
  );
}
