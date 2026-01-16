import { useField, useFormikContext } from "formik";
import Select from "react-select";

export default function MultiSelectDropdown({
  label,
  name,
  options,
  disabled = false,
}) {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(name);

  // Convert Formik values (array of values) to react-select options
  const currentValue =
    options?.filter((opt) => field.value?.includes(opt.value)) || [];

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-medium">{label}</label>}

      <Select
        isMulti
        isDisabled={disabled}
        value={currentValue}
        options={options}
        className="react-select-container"
        classNamePrefix="react-select"
        onChange={(selectedOptions) => {
          const values = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
          setFieldValue(name, values);
        }}
        onBlur={() => {
          setFieldTouched(name, true);
        }}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "#F9F8F8",
          }),
        }}
      />

      {meta.touched && meta.error && (
        <span className="text-red-500 text-[14px]">{meta.error}</span>
      )}
    </div>
  );
}
