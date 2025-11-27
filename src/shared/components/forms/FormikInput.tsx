import { useField } from "formik";

export const FormikInput = ({ ...props }) => {
  const [field, meta] = useField(props);

  return (
    <div className="w-full">
      <input
        {...field}
        {...props}
        className={`w-full bg-[#F8F8F8] border rounded-md px-3 py-1.5 outline-none transition
        ${props.disabled ? "cursor-not-allowed" : ""}
        ${
          meta.touched && meta.error
            ? "border-red-500"
            : "border-gray-300 focus:border-secondary"
        }`}
      />

      {meta.touched && meta.error && (
        <div className="text-red-500 text-xs mt-1">{meta.error}</div>
      )}
    </div>
  );
};
