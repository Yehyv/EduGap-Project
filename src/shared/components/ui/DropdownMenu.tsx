import { useField, useFormikContext } from "formik";
import Select from "react-select";

export default function DropdownMenu({
  label,
  name,
  options,
  disabled = false,
  required = false,
}) {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(name);

  const currentValue =
    options?.find((opt) => opt.value === field.value) || null;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-medium">
          {label}
          <span className="text-red-500 ms-1">{required ? "*" : ""}</span>
        </label>
      )}

      <Select
        isDisabled={disabled}
        value={currentValue}
        options={options}
        className="react-select-container"
        classNamePrefix="react-select"
        onChange={(opt) => {
          setFieldValue(name, opt?.value ?? "");
        }}
        onBlur={() => {
          setFieldTouched(name, true);
        }}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: `${disabled ? "#9ca3af5c" : "white"}`,
          }),
        }}
      />

      {meta.touched && meta.error && (
        <span className="text-red-500 text-[14px]">{meta.error}</span>
      )}
    </div>
  );
}
