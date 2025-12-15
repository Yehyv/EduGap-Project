// FileUploadField.jsx
import { useField, useFormikContext } from "formik";
import { useState } from "react";

export default function FileUploadField({
  label,
  name,
  placeholder,
  moreStyle,
}: {
  label: string;
  name: string;
  placeholder: string;
  moreStyle?: string;
}) {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.currentTarget.files[0];
    setFieldValue(name, file);

    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  return (
    <div className="flex flex-col gap-1 my-2">
      <label className="font-medium">{label}</label>

      {/* Hidden file input */}
      <input
        id={name}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        {/* Clickable input */}
        <input
          type="text"
          readOnly
          onClick={() => document.getElementById(name).click()}
          value={fileName || placeholder}
          className="cursor-pointer outline-0 focus:border-secondary border border-[#ACACAC] rounded-xl p-2 text-sm w-full bg-white"
        />

        {/* Button */}
        <label
          htmlFor={name}
          className={`cursor-pointer bg-secondary rounded-xl text-white text-nowrap py-1.5 px-6 hover:bg-secondary/90 ${moreStyle}`}
        >
          Upload
        </label>
      </div>

      {/* Preview image */}
      {field.value && typeof field.value !== "string" && (
        <img
          src={URL.createObjectURL(field.value)}
          alt="Preview"
          className="w-24 h-24 object-cover rounded-lg mt-2 border"
        />
      )}

      {/* Formik error */}
      {meta.touched && meta.error && (
        <p className="text-red-500 text-xs">{meta.error}</p>
      )}
    </div>
  );
}
