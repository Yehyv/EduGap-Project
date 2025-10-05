import { useField } from "formik";

type TextareaFieldProps = {
  label?: string;
  name: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
};

const TextareaField = ({
  label,
  name,
  placeholder,
  rows = 4,
  maxLength,
  className = "",
}: TextareaFieldProps) => {
  const [field, meta] = useField<string>(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="font-medium text-gray-700">
          {label}
        </label>
      )}

      <textarea
        {...field}
        id={name}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={hasError}
        className={`w-full resize-none bg-white border ${
          hasError ? "border-red-500" : "border-gray-200"
        } px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary !border-[#9E9C9C] transition`}
      />

      {/* character counter if maxLength set */}
      {maxLength && (
        <div className="text-xs text-gray-400 self-end">
          {field.value?.length || 0}/{maxLength}
        </div>
      )}

      {hasError && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </div>
  );
};

export default TextareaField;
