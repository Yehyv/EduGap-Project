import { useField } from "formik";

type SelectFieldProps = {
  label?: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
};

const SelectField = ({
  label,
  name,
  options,
  placeholder,
  className = "",
}: SelectFieldProps) => {
  const [field, meta] = useField<string>(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-[#9E9C9C]">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          {...field}
          id={name}
          aria-invalid={hasError}
          className={`w-full appearance-none bg-white border ${
            hasError ? "border-red-500" : "border-[#9E9C9C]"
          } px-3 py-2 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition`}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* custom arrow */}
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="w-4 h-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>

      {hasError ? <div className="text-red-500 mt-1">{meta.error}</div> : null}
    </div>
  );
};

export default SelectField;
