import { useField, useFormikContext } from "formik";
import { useState, useCallback } from "react";
import FileIcon from "@/assets/svgs/FileIcon.svg?react";

export default function FileUploadField({
  label,
  name,
  placeholder,
  moreStyle,
  image,
}: {
  label: string;
  name: string;
  placeholder: string;
  moreStyle?: string;
  image?: string;
}) {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(name);

  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  /* ================= HANDLERS ================= */

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;

      setFieldValue(name, file, true);
      setFieldTouched(name, true, false);
      setFileName(file.name);
    },
    [name, setFieldValue, setFieldTouched]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0] || null;
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
  };

  /* ================= UI ================= */

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

      {/* Upload Area */}
      <label
        htmlFor={name}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-transparent dashed-border cursor-pointer center flex-col
          border w-full rounded-lg p-5 transition
          ${isDragging ? "bg-gray-100" : ""}
          ${moreStyle}
        `}
      >
        <FileIcon />

        <span>
          <span className="text-secondary">اضغط للتحميل</span> او اسحب و ضع
        </span>

        <span className="text-xs text-gray-500">{fileName || placeholder}</span>

        <span className="text-xs text-gray-400">PNG, JPG, WEBP</span>
      </label>

      {/* Preview */}
      {field.value && typeof field.value !== "string" && (
        <img
          src={URL.createObjectURL(field.value)}
          alt="Preview"
          className="w-40 h-40 object-cover rounded-lg mt-2 border"
        />
      )}
      {/* Preview */}
      {image && !(field.value && typeof field.value !== "string") && (
        <img
          src={field.value}
          alt="Preview"
          className="w-40 h-40 object-cover rounded-lg mt-2 border"
        />
      )}

      {/* Error */}
      {meta.touched && meta.error && (
        <p className="text-red-500 text-xs">{meta.error}</p>
      )}
    </div>
  );
}
